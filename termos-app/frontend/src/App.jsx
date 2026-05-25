import React, { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/termo'

export default function App() {
  const [type, setType] = useState('entrega')
  const [matricula, setMatricula] = useState('')
  const [nome, setNome] = useState('')
  const [equipTipo, setEquipTipo] = useState('')
  const [equipModelo, setEquipModelo] = useState('')
  const [equipSerial, setEquipSerial] = useState('')
  const [acessorios, setAcessorios] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files))
  }

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fotos = []
      for (const f of files) {
        const b = await toBase64(f)
        fotos.push(b)
      }

      const payload = {
        type,
        matricula,
        nome,
        equipamento: { tipo: equipTipo, modelo: equipModelo, serial: equipSerial },
        acessorios,
        observacoes,
        fotos,
        incidentNumber: null
      }

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      setResult(data)
    } catch (err) {
      console.error(err)
      alert('Erro ao enviar termo: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>Termo de {type === 'entrega' ? 'Entrega' : 'Devolução'}</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>Tipo</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="entrega">Entrega</option>
          <option value="devolucao">Devolução</option>
        </select>

        <label>Matrícula</label>
        <input value={matricula} onChange={e => setMatricula(e.target.value)} required />

        <label>Nome do colaborador</label>
        <input value={nome} onChange={e => setNome(e.target.value)} required />

        <label>Equipamento - Tipo</label>
        <input value={equipTipo} onChange={e => setEquipTipo(e.target.value)} required />

        <label>Equipamento - Modelo</label>
        <input value={equipModelo} onChange={e => setEquipModelo(e.target.value)} />

        <label>Equipamento - Serial/IMEI</label>
        <input value={equipSerial} onChange={e => setEquipSerial(e.target.value)} required />

        <label>Acessórios</label>
        <input value={acessorios} onChange={e => setAcessorios(e.target.value)} required />

        <label>Observações</label>
        <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} />

        <label>Fotos do equipamento (até 5)</label>
        <input type="file" accept="image/*" multiple onChange={handleFiles} />

        <button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Gerar Termo'}</button>
      </form>

      {result && (
        <div className="result">
          <h2>Resultado</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
