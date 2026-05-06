import { useEffect, useState, useRef } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

// ── RESPUESTAS DEL CHAT ────────────────────────────────────
const RESPUESTAS = [
  {
    id: 'venta',
    claves: ['vend', 'sell', 'comprar', 'cobrar', 'pagar'],
    texto: 'Para registrar una venta, ve a la sección "Galería", busca el cuadro y haz clic en "Registrar venta". El sistema te pedirá el método de pago (efectivo, tarjeta o transferencia) y actualizará el stock automáticamente.',
    sugs: ['¿Qué métodos de pago hay?', '¿Dónde veo el historial de ventas?', '¿Qué pasa si el stock es 0?']
  },
  {
    id: 'agregar_cuadro',
    claves: ['agrego', 'agregar', 'nuevo cuadro', 'añadir cuadro', 'crear cuadro', 'subir cuadro'],
    texto: 'Ve a "Inventario" y llena el formulario con nombre, costo, dimensiones, medio, URL de imagen y stock. Haz clic en "Guardar cuadro" y aparecerá en la galería.',
    sugs: ['¿Cómo agrego la imagen de un cuadro?', '¿Cómo edito un cuadro ya guardado?', '¿Cómo elimino un cuadro?']
  },
  {
    id: 'inventario',
    claves: ['inventario', 'almacen', 'almacén', 'existencia', 'cantidad'],
    texto: 'En la sección "Inventario" puedes ver todos los cuadros registrados, editar su precio y stock, o eliminarlos. También puedes agregar nuevos cuadros desde ahí.',
    sugs: ['¿Cómo edito un cuadro?', '¿Cómo agrego un cuadro nuevo?', '¿Cómo elimino un cuadro?']
  },
  {
    id: 'stock_cero',
    claves: ['stock 0', 'sin stock', 'agotado', 'no hay', 'stock cero', 'stock llega', 'stock es 0'],
    texto: 'Si el stock de un cuadro llega a 0, el sistema bloqueará nuevas ventas para ese cuadro. Ve a "Inventario", haz clic en "Editar" y actualiza el stock con la cantidad disponible.',
    sugs: ['¿Cómo edito el stock de un cuadro?', '¿Dónde está la sección Inventario?', '¿Cómo registro una venta?']
  },
  {
    id: 'editar',
    claves: ['editar', 'actualizar', 'cambiar precio', 'modificar', 'corregir'],
    texto: 'En "Inventario", en la tabla de cuadros existentes, haz clic en "Editar" junto al cuadro que quieras modificar. Puedes actualizar el costo y el stock desde ahí.',
    sugs: ['¿Cómo elimino un cuadro?', '¿Cómo agrego un cuadro nuevo?', '¿Qué pasa si el stock llega a 0?']
  },
  {
    id: 'eliminar',
    claves: ['eliminar', 'borrar', 'quitar cuadro', 'remover'],
    texto: 'En "Inventario", en la tabla de cuadros, haz clic en "Eliminar" junto al cuadro que deseas borrar. El sistema pedirá confirmación antes de eliminarlo.',
    sugs: ['¿Cómo edito un cuadro?', '¿Cómo agrego un cuadro nuevo?', '¿Cómo veo la galería?']
  },
  {
    id: 'artista',
    claves: ['artista', 'pintor', 'autor', 'creador', 'registrar artista', 'agregar artista'],
    texto: 'Ve a la sección "Artistas" y llena el formulario con nombre, nacionalidad, fechas de nacimiento y fallecimiento (opcionales) y URL de foto. Haz clic en "Guardar artista".',
    sugs: ['¿Cómo agrego la foto de un artista?', '¿Cómo registro un cuadro?', '¿Cómo veo los artistas registrados?']
  },
  {
    id: 'ventas_historial',
    claves: ['historial', 'transaccion', 'transacción', 'reporte', 'ver ventas'],
    texto: 'En la sección "Ventas" puedes ver el historial completo de transacciones, incluyendo el cuadro vendido, el total, la fecha y el método de pago.',
    sugs: ['¿Cómo registro una venta?', '¿Qué métodos de pago hay?', '¿Puedo eliminar una venta?']
  },
  {
    id: 'eliminar_venta',
    claves: ['eliminar venta', 'borrar venta', 'quitar venta'],
    texto: 'Actualmente el sistema no permite eliminar ventas, para mantener la integridad del historial de transacciones. Si hay un error, contacta al administrador.',
    sugs: ['¿Cómo veo el historial de ventas?', '¿Cómo registro una venta?', '¿Cómo edito un cuadro?']
  },
  {
    id: 'metodo_pago',
    claves: ['metodo', 'método', 'pago', 'efectivo', 'tarjeta', 'transferencia'],
    texto: 'Al registrar una venta, el sistema te preguntará el método de pago. Puedes elegir entre: efectivo, tarjeta o transferencia. Ese dato quedará guardado en el historial.',
    sugs: ['¿Cómo registro una venta?', '¿Dónde veo el historial de ventas?', '¿Cómo agrego un cuadro?']
  },
  {
    id: 'galeria',
    claves: ['galeria', 'galería', 'coleccion', 'colección', 'ver cuadros'],
    texto: 'En la sección "Galería" puedes ver todos los cuadros disponibles con su imagen, precio, dimensiones, medio y stock. Desde ahí también puedes registrar ventas.',
    sugs: ['¿Cómo vendo un cuadro desde la galería?', '¿Cómo agrego un cuadro nuevo?', '¿Cómo edito un cuadro?']
  },
  {
    id: 'imagen',
    claves: ['foto', 'imagen', 'url', 'link', 'fotografía', 'fotografia'],
    texto: 'Para agregar una imagen, necesitas una URL pública (por ejemplo de Google Drive, Imgur o cualquier hosting de imágenes). Pégala en el campo "URL de imagen" del formulario.',
    sugs: ['¿Cómo agrego un cuadro?', '¿Cómo registro un artista?', '¿Cómo edito un cuadro ya guardado?']
  },
  {
    id: 'inicio',
    claves: ['inicio', 'panel', 'dashboard', 'principal', 'resumen'],
    texto: 'En el "Panel Principal" puedes ver un resumen con el total de cuadros, artistas y ventas registradas, además de tus datos de usuario y accesos rápidos a cada sección.',
    sugs: ['¿Cómo registro una venta?', '¿Cómo agrego un cuadro?', '¿Cómo veo el historial de ventas?']
  },
  {
    id: 'sesion',
    claves: ['sesion', 'sesión', 'cerrar', 'salir', 'logout'],
    texto: 'Para cerrar sesión, haz clic en el botón "Cerrar sesión" que aparece al final del menú lateral. Serás redirigido a la pantalla de inicio de sesión.',
    sugs: ['¿Cómo inicio sesión?', '¿Cómo veo el panel principal?', '¿Cómo cambio mi contraseña?']
  },
  {
    id: 'contrasena',
    claves: ['contraseña', 'password', 'clave', 'acceso'],
    texto: 'Si olvidaste tu contraseña o tienes problemas para acceder, comunícate con el administrador del sistema para que restablezca tus credenciales.',
    sugs: ['¿Cómo cierro sesión?', '¿Cómo veo mis datos de usuario?', '¿Cómo registro una venta?']
  },
  {
    id: 'saludo',
    claves: ['hola', 'buenas', 'hi', 'hey', 'saludos', 'buen dia', 'buenas tardes'],
    texto: '¡Hola! ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre cómo usar cualquier parte del sistema.',
    sugs: ['¿Cómo registro una venta?', '¿Cómo agrego un cuadro?', '¿Cómo registro un artista?', '¿Cómo veo las ventas?']
  },
  {
    id: 'gracias',
    claves: ['gracias', 'perfecto', 'listo', 'entendi', 'ok', 'excelente'],
    texto: '¡De nada! Si tienes alguna otra duda, aquí estaré.',
    sugs: ['¿Cómo registro una venta?', '¿Cómo agrego un cuadro?', '¿Cómo veo el historial de ventas?']
  },
]

const FALLBACK_TEXTO = 'No encontré una respuesta exacta para eso. Intenta preguntar sobre: ventas, inventario, cuadros, artistas, stock, métodos de pago o cómo usar alguna sección del sistema.'
const FALLBACK_SUGS = ['¿Cómo registro una venta?', '¿Cómo agrego un cuadro?', '¿Cómo registro un artista?', '¿Qué métodos de pago hay?']

const SUGS_INICIALES = [
  '¿Cómo vendo un cuadro?',
  '¿Cómo agrego un cuadro?',
  '¿Cómo veo las ventas?',
  '¿Cómo registro un artista?',
  '¿Qué hago si el stock es 0?',
]

function normalizar(txt) {
  return txt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function buscarRespuesta(texto) {
  const t = normalizar(texto)
  for (const r of RESPUESTAS) {
    if (r.claves.some(c => t.includes(normalizar(c)))) {
      return { texto: r.texto, sugs: r.sugs }
    }
  }
  return { texto: FALLBACK_TEXTO, sugs: FALLBACK_SUGS }
}

// ── COMPONENTE CHAT ────────────────────────────────────────
function ChatAsistente() {
  const [mensajes, setMensajes] = useState([
    { tipo: 'bot', texto: '¡Hola! Soy el asistente de la galería. Puedo ayudarte con dudas sobre el sistema. ¿Qué necesitas?' }
  ])
  const [sugsActuales, setSugsActuales] = useState(SUGS_INICIALES)
  const [input, setInput] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, escribiendo])

  function enviar(texto) {
    const msg = texto || input.trim()
    if (!msg) return
    setInput('')
    setSugsActuales([])
    setMensajes(prev => [...prev, { tipo: 'user', texto: msg }])
    setEscribiendo(true)
    setTimeout(() => {
      const { texto: respTxt, sugs } = buscarRespuesta(msg)
      setEscribiendo(false)
      setMensajes(prev => [...prev, { tipo: 'bot', texto: respTxt }])
      setSugsActuales(sugs)
    }, 650)
  }

  return (
    <div className="chat-contenedor">
      <div className="chat-header">
        <span className="chat-dot" />
        <span className="chat-titulo">Asistente de la Galería</span>
        <span className="chat-sub">Ayuda del sistema</span>
      </div>

      <div className="chat-mensajes">
        {mensajes.map((m, i) => (
          <div key={i} className={`chat-msg chat-msg-${m.tipo}`}>{m.texto}</div>
        ))}
        {escribiendo && (
          <div className="chat-msg chat-msg-bot chat-typing">
            <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {!escribiendo && sugsActuales.length > 0 && (
        <div className="chat-sugs">
          {sugsActuales.map((s, i) => (
            <button key={i} className="chat-sug" onClick={() => enviar(s)}>{s}</button>
          ))}
        </div>
      )}

      <div className="chat-input-fila">
        <input
          className="chat-input"
          type="text"
          placeholder="Escribe tu pregunta..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && enviar()}
          disabled={escribiendo}
        />
        <button className="chat-btn-enviar" onClick={() => enviar()} disabled={escribiendo || !input.trim()}>
          Enviar
        </button>
      </div>
    </div>
  )
}

// ── APP PRINCIPAL ──────────────────────────────────────────
function App() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [usuario, setUsuario] = useState(null)
  const [mensajeLogin, setMensajeLogin] = useState('')
  const [pantalla, setPantalla] = useState('inicio')
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [cuadros, setCuadros] = useState([])
  const [artistas, setArtistas] = useState([])
  const [ventas, setVentas] = useState([])
  const [mensaje, setMensaje] = useState('')

  const [formCuadro, setFormCuadro] = useState({
    Nombre: '', Costo: '', Dimensiones: '', Medio: '', Foto: '', Stock: 1
  })
  const [formArtista, setFormArtista] = useState({
    Nombre: '', Nacionalidad: '', Nacimiento: '', Fallecimiento: '', Foto: ''
  })

  useEffect(() => { if (usuario) cargarDatos() }, [usuario])

  function navegarA(seccion) { setPantalla(seccion); setMenuAbierto(false) }

  async function iniciarSesion(e) {
    e.preventDefault(); setMensajeLogin('')
    const { data, error } = await supabase.from('perfiles').select('*')
      .eq('Correo', correo.trim()).eq('Contraseña', contrasena).maybeSingle()
    if (error) { console.log(error); setMensajeLogin('Error al consultar la base de datos'); return }
    if (!data) { setMensajeLogin('Correo o contraseña incorrectos'); return }
    setUsuario(data); setPantalla('inicio')
  }

  function cerrarSesion() {
    setUsuario(null); setCorreo(''); setContrasena(''); setMensajeLogin(''); setPantalla('inicio'); setMenuAbierto(false)
  }

  async function cargarDatos() {
    setMensaje('Cargando...')
    const cuadrosResp  = await supabase.from('cuadros').select('*').order('id_cuadro', { ascending: true })
    const artistasResp = await supabase.from('artistas').select('*').order('id_Artista', { ascending: true })
    const ventasResp   = await supabase.from('ventas').select('*').order('id_Venta', { ascending: false })
    if (cuadrosResp.error)  console.log(cuadrosResp.error)
    if (artistasResp.error) console.log(artistasResp.error)
    if (ventasResp.error)   console.log(ventasResp.error)
    setCuadros(cuadrosResp.data || [])
    setArtistas(artistasResp.data || [])
    setVentas(ventasResp.data || [])
    setMensaje('')
  }

  async function guardarCuadro(e) {
    e.preventDefault()
    const nuevoCuadro = { Nombre: formCuadro.Nombre, Costo: Number(formCuadro.Costo), Dimensiones: formCuadro.Dimensiones, Medio: formCuadro.Medio, Foto: formCuadro.Foto, Stock: Number(formCuadro.Stock) }
    const { error } = await supabase.from('cuadros').insert([nuevoCuadro])
    if (error) { console.log(error); alert('No se pudo guardar el cuadro'); return }
    alert('Cuadro guardado correctamente')
    setFormCuadro({ Nombre: '', Costo: '', Dimensiones: '', Medio: '', Foto: '', Stock: 1 })
    cargarDatos()
  }

  async function actualizarCuadro(cuadro) {
    const nuevoCosto = prompt('Nuevo costo:', cuadro.Costo)
    const nuevoStock = prompt('Nuevo stock:', cuadro.Stock ?? 1)
    if (nuevoCosto === null || nuevoStock === null) return
    const { error } = await supabase.from('cuadros').update({ Costo: Number(nuevoCosto), Stock: Number(nuevoStock) }).eq('id_cuadro', cuadro.id_cuadro)
    if (error) { console.log(error); alert('No se pudo actualizar el cuadro'); return }
    alert('Cuadro actualizado'); cargarDatos()
  }

  async function eliminarCuadro(cuadro) {
    if (!confirm(`¿Seguro que quieres eliminar "${cuadro.Nombre}"?`)) return
    const { error } = await supabase.from('cuadros').delete().eq('id_cuadro', cuadro.id_cuadro)
    if (error) { console.log(error); alert('No se pudo eliminar el cuadro'); return }
    alert('Cuadro eliminado'); cargarDatos()
  }

  async function registrarVenta(cuadro) {
    const stockActual = Number(cuadro.Stock ?? 1)
    if (stockActual <= 0) { alert('No hay stock disponible para este cuadro'); return }
    const metodoPago = prompt('Método de pago: efectivo, tarjeta o transferencia', 'efectivo')
    if (!metodoPago) return
    const { error: errorVenta } = await supabase.from('ventas').insert([{ Total: Number(cuadro.Costo || 0), Hora: new Date().toISOString().slice(0, 10), Metodo_Pago: metodoPago, Nombre_Cuadro: cuadro.Nombre, id_cuadro: cuadro.id_cuadro }])
    if (errorVenta) { console.log(errorVenta); alert('No se pudo registrar la venta'); return }
    const { error: errorStock } = await supabase.from('cuadros').update({ Stock: stockActual - 1 }).eq('id_cuadro', cuadro.id_cuadro)
    if (errorStock) { console.log(errorStock); alert('La venta se registró, pero no se pudo actualizar el stock'); return }
    alert('Venta registrada correctamente'); cargarDatos(); setPantalla('ventas')
  }

  async function guardarArtista(e) {
    e.preventDefault()
    const nuevoArtista = { Nombre: formArtista.Nombre, Nacionalidad: formArtista.Nacionalidad, Nacimiento: formArtista.Nacimiento || null, Fallecimiento: formArtista.Fallecimiento || null, Foto: formArtista.Foto }
    const { error } = await supabase.from('artistas').insert([nuevoArtista])
    if (error) { console.log(error); alert('No se pudo guardar el artista'); return }
    alert('Artista guardado correctamente')
    setFormArtista({ Nombre: '', Nacionalidad: '', Nacimiento: '', Fallecimiento: '', Foto: '' })
    cargarDatos()
  }

  // ── LOGIN ──────────────────────────────────────────────────
  if (!usuario) {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={iniciarSesion}>
          <h1>Galería de Arte</h1>
          <h2>Acceso al sistema</h2>
          <label>Correo electrónico</label>
          <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="correo@ejemplo.com" required />
          <label>Contraseña</label>
          <input type="password" value={contrasena} onChange={e => setContrasena(e.target.value)} placeholder="••••••••" required />
          <button type="submit">Iniciar sesión</button>
          {mensajeLogin && <p className="error">{mensajeLogin}</p>}
        </form>
      </div>
    )
  }

  // ── APP ────────────────────────────────────────────────────
  return (
    <div className="app">
      {menuAbierto && <div className="menu-overlay" onClick={() => setMenuAbierto(false)} />}

      <div className="topbar">
        <span className="topbar-titulo">Galería de Arte</span>
        <button className="hamburger" onClick={() => setMenuAbierto(!menuAbierto)} aria-label="Menú">
          <span className={`ham-line ${menuAbierto ? 'ham-open' : ''}`} />
          <span className={`ham-line ${menuAbierto ? 'ham-open' : ''}`} />
          <span className={`ham-line ${menuAbierto ? 'ham-open' : ''}`} />
        </button>
      </div>

      <aside className={`menu ${menuAbierto ? 'menu-visible' : ''}`}>
        <div className="menu-header">
          <h2>Galería de Arte</h2>
        </div>
        <nav className="menu-nav">
          <button onClick={() => navegarA('inicio')}>Inicio</button>
          <button onClick={() => navegarA('galeria')}>Galería</button>
          <button onClick={() => navegarA('ventas')}>Ventas</button>
          <button onClick={() => navegarA('inventario')}>Inventario</button>
          <button onClick={() => navegarA('artistas')}>Artistas</button>
          <button onClick={() => navegarA('chat')}>Asistente</button>
        </nav>
        <button className="btn-salir" onClick={cerrarSesion}>Cerrar sesión</button>
      </aside>

      <main className="contenido">
        {mensaje && <p className="msg-carga">{mensaje}</p>}

        {/* ── INICIO ── */}
        {pantalla === 'inicio' && (
          <section>
            <h1>Panel Principal</h1>
            <span className="section-tag">Bienvenido, {usuario.Nombre}</span>
            <div className="resumen">
              <div className="resumen-card"><h3>{cuadros.length}</h3><p>Cuadros registrados</p></div>
              <div className="resumen-card"><h3>{artistas.length}</h3><p>Artistas registrados</p></div>
              <div className="resumen-card"><h3>{ventas.length}</h3><p>Ventas registradas</p></div>
            </div>
            <div className="inicio-grid">
              <div className="perfil">
                <h2>Datos del usuario</h2>
                <p><strong>Nombre</strong>{usuario.Nombre}</p>
                <p><strong>Apellido paterno</strong>{usuario.ApellidoP}</p>
                <p><strong>Apellido materno</strong>{usuario.ApellidoM}</p>
                <p><strong>Correo</strong>{usuario.Correo}</p>
                <p><strong>Teléfono</strong>{usuario.Telefono}</p>
              </div>
              <div className="accesos-rapidos">
                <h2>Accesos rápidos</h2>
                <div className="accesos-grid">
                  <button className="acceso-btn" onClick={() => navegarA('galeria')}><span className="acceso-icono">🖼️</span><span>Ver galería</span></button>
                  <button className="acceso-btn" onClick={() => navegarA('ventas')}><span className="acceso-icono">📊</span><span>Ver ventas</span></button>
                  <button className="acceso-btn" onClick={() => navegarA('inventario')}><span className="acceso-icono">📦</span><span>Inventario</span></button>
                  <button className="acceso-btn" onClick={() => navegarA('artistas')}><span className="acceso-icono">🎨</span><span>Artistas</span></button>
                </div>
              </div>
            </div>
            <div className="inicio-chat">
              <h2>¿Tienes alguna duda?</h2>
              <span className="section-tag" style={{ marginBottom: '16px' }}>Consulta al asistente del sistema</span>
              <ChatAsistente />
            </div>
          </section>
        )}

        {/* ── GALERÍA ── */}
        {pantalla === 'galeria' && (
          <section>
            <h1>Galería de Cuadros</h1>
            <span className="section-tag">Colección disponible</span>
            <div className="grid">
              {cuadros.map(cuadro => (
                <div className="card" key={cuadro.id_cuadro}>
                  {cuadro.Foto && <img src={cuadro.Foto} alt={cuadro.Nombre} className="imagen-cuadro" loading="lazy" decoding="async" onLoad={e => e.currentTarget.classList.add('cargada')} />}
                  <div className="card-body">
                    <h3>{cuadro.Nombre}</h3>
                    <p><strong>Costo</strong>${cuadro.Costo}</p>
                    <p><strong>Dimensiones</strong>{cuadro.Dimensiones}</p>
                    <p><strong>Medio</strong>{cuadro.Medio}</p>
                    <p><strong>Stock</strong>{cuadro.Stock ?? 1}</p>
                  </div>
                  <button onClick={() => registrarVenta(cuadro)}>Registrar venta</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── VENTAS ── */}
        {pantalla === 'ventas' && (
          <section>
            <h1>Ventas Registradas</h1>
            <span className="section-tag">Historial de transacciones</span>
            <div className="tabla-wrapper">
              <table>
                <thead><tr><th>ID</th><th>Cuadro</th><th>Total</th><th>Fecha</th><th>Método de pago</th></tr></thead>
                <tbody>
                  {ventas.map(venta => (
                    <tr key={venta.id_Venta}>
                      <td>{venta.id_Venta}</td><td>{venta.Nombre_Cuadro}</td>
                      <td>${venta.Total}</td><td>{venta.Hora}</td><td>{venta.Metodo_Pago}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── INVENTARIO ── */}
        {pantalla === 'inventario' && (
          <section>
            <h1>Inventario</h1>
            <span className="section-tag">Gestión de almacenamiento</span>
            <form className="formulario" onSubmit={guardarCuadro}>
              <h2>Agregar nuevo cuadro</h2>
              <input type="text" placeholder="Nombre del cuadro" value={formCuadro.Nombre} onChange={e => setFormCuadro({ ...formCuadro, Nombre: e.target.value })} required />
              <input type="number" placeholder="Costo" value={formCuadro.Costo} onChange={e => setFormCuadro({ ...formCuadro, Costo: e.target.value })} required />
              <input type="text" placeholder="Dimensiones" value={formCuadro.Dimensiones} onChange={e => setFormCuadro({ ...formCuadro, Dimensiones: e.target.value })} />
              <input type="text" placeholder="Medio" value={formCuadro.Medio} onChange={e => setFormCuadro({ ...formCuadro, Medio: e.target.value })} />
              <input type="text" placeholder="URL de imagen" value={formCuadro.Foto} onChange={e => setFormCuadro({ ...formCuadro, Foto: e.target.value })} />
              <input type="number" placeholder="Stock" value={formCuadro.Stock} onChange={e => setFormCuadro({ ...formCuadro, Stock: e.target.value })} required />
              <button type="submit">Guardar cuadro</button>
            </form>
            <h2 className="subtitulo-seccion">Cuadros existentes</h2>
            <div className="tabla-wrapper">
              <table>
                <thead><tr><th>ID</th><th>Nombre</th><th>Costo</th><th>Stock</th><th>Acciones</th></tr></thead>
                <tbody>
                  {cuadros.map(cuadro => (
                    <tr key={cuadro.id_cuadro}>
                      <td>{cuadro.id_cuadro}</td><td>{cuadro.Nombre}</td>
                      <td>${cuadro.Costo}</td><td>{cuadro.Stock ?? 1}</td>
                      <td>
                        <button onClick={() => actualizarCuadro(cuadro)}>Editar</button>
                        <button className="btn-eliminar" onClick={() => eliminarCuadro(cuadro)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── ARTISTAS ── */}
        {pantalla === 'artistas' && (
          <section>
            <h1>Artistas</h1>
            <span className="section-tag">Directorio de creadores</span>
            <form className="formulario" onSubmit={guardarArtista}>
              <h2>Agregar artista</h2>
              <input type="text" placeholder="Nombre del artista" value={formArtista.Nombre} onChange={e => setFormArtista({ ...formArtista, Nombre: e.target.value })} required />
              <input type="text" placeholder="Nacionalidad" value={formArtista.Nacionalidad} onChange={e => setFormArtista({ ...formArtista, Nacionalidad: e.target.value })} />
              <input type="date" value={formArtista.Nacimiento} onChange={e => setFormArtista({ ...formArtista, Nacimiento: e.target.value })} />
              <input type="date" value={formArtista.Fallecimiento} onChange={e => setFormArtista({ ...formArtista, Fallecimiento: e.target.value })} />
              <input type="text" placeholder="URL de foto" value={formArtista.Foto} onChange={e => setFormArtista({ ...formArtista, Foto: e.target.value })} />
              <button type="submit">Guardar artista</button>
            </form>
            <div className="grid">
              {artistas.map(artista => (
                <div className="card" key={artista.id_Artista}>
                  {artista.Foto && <img src={artista.Foto} alt={artista.Nombre} className="imagen-cuadro" loading="lazy" decoding="async" onLoad={e => e.currentTarget.classList.add('cargada')} />}
                  <div className="card-body">
                    <h3>{artista.Nombre}</h3>
                    <p><strong>Nacionalidad</strong>{artista.Nacionalidad}</p>
                    <p><strong>Nacimiento</strong>{artista.Nacimiento}</p>
                    <p><strong>Fallecimiento</strong>{artista.Fallecimiento}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── CHAT ── */}
        {pantalla === 'chat' && (
          <section>
            <h1>Asistente Virtual</h1>
            <span className="section-tag">Chat de ayuda del sistema</span>
            <ChatAsistente />
          </section>
        )}
      </main>
    </div>
  )
}

export default App