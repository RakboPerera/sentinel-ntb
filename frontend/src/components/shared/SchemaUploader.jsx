import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export default function SchemaUploader({ schema, onSubmit, loading, error, agentColor }) {
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [mapping, setMapping] = useState({});
  const [needsMapping, setNeedsMapping] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  function processFile(f) {
    setFile(f);
    setParseError(null);
    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          setParseError('Could not parse CSV. Please check the file format.');
          return;
        }
        const cols = Object.keys(results.data[0] || {});
        const required = schema.required || [];
        const directMatch = required.every(r => cols.includes(r));
        if (directMatch) {
          setParsed(results.data);
          setNeedsMapping(false);
        } else {
          const autoMap = {};
          required.forEach(req => {
            const match = cols.find(c => c.toLowerCase().replace(/[^a-z0-9]/g, '') === req.toLowerCase().replace(/[^a-z0-9]/g, ''));
            autoMap[req] = match || '';
          });
          setMapping(autoMap);
          setParsed(results.data);
          setNeedsMapping(true);
        }
      },
      error: () => setParseError('Failed to parse file.'),
    });
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith('.csv')) processFile(f);
  }

  function handleSubmit() {
    let rows = parsed;
    if (needsMapping) {
      rows = parsed.map(row => {
        const mapped = {};
        Object.entries(mapping).forEach(([req, col]) => {
          if (col) mapped[req] = row[col];
        });
        return mapped;
      });
    }
    onSubmit(rows.slice(0, 2000)); // cap at 2000 rows
  }

  const fileColumns = parsed ? Object.keys(parsed[0] || {}) : [];
  const required = schema.required || [];
  const optional = schema.optional || [];

  return (
    <div>
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          style={{ border: `2px dashed ${dragOver ? agentColor : 'var(--color-border-strong)'}`, borderRadius: 12, padding: '40px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: dragOver ? `${agentColor}08` : 'transparent' }}
        >
          <Upload size={32} style={{ color: 'var(--color-text-3)', marginBottom: 12 }} />
          <div style={{ fontWeight: 500, marginBottom: 6 }}>Drop your CSV here or click to browse</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-2)' }}>CSV format · max 2,000 rows processed</div>
          <input ref={inputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => e.target.files[0] && processFile(e.target.files[0])} />
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--color-surface-2)', borderRadius: 8, marginBottom: 16 }}>
          <FileText size={16} />
          <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{file.name}</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-2)' }}>{parsed?.length} rows</span>
          <button onClick={() => { setFile(null); setParsed(null); setNeedsMapping(false); }} style={{ fontSize: 12, color: 'var(--color-red)', cursor: 'pointer' }}>Remove</button>
        </div>
      )}

      {parseError && (
        <div style={{ display: 'flex', gap: 8, padding: 12, background: 'var(--color-red-light)', borderRadius: 8, color: 'var(--color-red)', fontSize: 13, marginTop: 12 }}>
          <AlertCircle size={15} /> {parseError}
        </div>
      )}

      {/* Schema reference */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 10 }}>Required columns</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {required.map(col => (
            <code key={col} style={{ fontSize: 11, padding: '3px 8px', background: `${agentColor}12`, color: agentColor, borderRadius: 4, border: `1px solid ${agentColor}22` }}>{col}</code>
          ))}
        </div>
        {optional.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-3)', marginBottom: 8 }}>Optional columns</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {optional.map(col => (
                <code key={col} style={{ fontSize: 11, padding: '3px 8px', background: 'var(--color-surface-2)', color: 'var(--color-text-2)', borderRadius: 4, border: '1px solid var(--color-border)' }}>{col}</code>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Column mapping */}
      {needsMapping && parsed && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Map your columns to the required schema</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {required.map(req => (
              <div key={req} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <code style={{ minWidth: 160, padding: '4px 8px', background: `${agentColor}10`, borderRadius: 4, color: agentColor }}>{req}</code>
                <select value={mapping[req] || ''} onChange={e => setMapping(m => ({ ...m, [req]: e.target.value }))} style={{ flex: 1 }}>
                  <option value="">— not mapped —</option>
                  {fileColumns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {parsed && (
        <div style={{ marginTop: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || (needsMapping && required.some(r => !mapping[r]))}
            style={{ background: agentColor }}
          >
            {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Running analysis...</> : `⚡ Run ${schema.agentName || 'Agent'} Analysis`}
          </button>
          <span style={{ fontSize: 12, color: 'var(--color-text-2)' }}>{parsed.length} rows · Claude Sonnet</span>
        </div>
      )}
    </div>
  );
}
