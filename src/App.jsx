import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [usuario, setUsuario] = useState(null)
  const [mensajeLogin, setMensajeLogin] = useState('')

  const [pantalla, setPantalla] = useState('inicio')

  const [cuadros, setCuadros] = useState([])
  const [artistas, setArtistas] = useState([])
  const [ventas, setVentas] = useState([])
  const [mensaje, setMensaje] = useState('')

  const [formCuadro, setFormCuadro] = useState({
    Nombre: '',
    Costo: '',
    Dimensiones: '',
    Medio: '',
    Foto: '',
    Stock: 1
  })

  const [formArtista, setFormArtista] = useState({
    Nombre: '',
    Nacionalidad: '',
    Nacimiento: '',
    Fallecimiento: '',
    Foto: ''
  })

  useEffect(() => {
    if (usuario) {
      cargarDatos()
    }
  }, [usuario])

  async function iniciarSesion(e) {
    e.preventDefault()
    setMensajeLogin('')

    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('Correo', correo.trim())
      .eq('Contraseña', contrasena)
      .maybeSingle()

    if (error) {
      console.log(error)
      setMensajeLogin('Error al consultar la base de datos')
      return
    }

    if (!data) {
      setMensajeLogin('Correo o contraseña incorrectos')
      return
    }

    setUsuario(data)
    setPantalla('inicio')
  }

  function cerrarSesion() {
    setUsuario(null)
    setCorreo('')
    setContrasena('')
    setMensajeLogin('')
    setPantalla('inicio')
  }

  async function cargarDatos() {
    setMensaje('Cargando datos...')

    const cuadrosResp = await supabase
      .from('cuadros')
      .select('*')
      .order('id_cuadro', { ascending: true })

    const artistasResp = await supabase
      .from('artistas')
      .select('*')
      .order('id_Artista', { ascending: true })

    const ventasResp = await supabase
      .from('ventas')
      .select('*')
      .order('id_Venta', { ascending: false })

    if (cuadrosResp.error) {
      console.log(cuadrosResp.error)
    }

    if (artistasResp.error) {
      console.log(artistasResp.error)
    }

    if (ventasResp.error) {
      console.log(ventasResp.error)
    }

    setCuadros(cuadrosResp.data || [])
    setArtistas(artistasResp.data || [])
    setVentas(ventasResp.data || [])
    setMensaje('')
  }

  async function guardarCuadro(e) {
    e.preventDefault()

    const nuevoCuadro = {
      Nombre: formCuadro.Nombre,
      Costo: Number(formCuadro.Costo),
      Dimensiones: formCuadro.Dimensiones,
      Medio: formCuadro.Medio,
      Foto: formCuadro.Foto,
      Stock: Number(formCuadro.Stock)
    }

    const { error } = await supabase
      .from('cuadros')
      .insert([nuevoCuadro])

    if (error) {
      console.log(error)
      alert('No se pudo guardar el cuadro')
      return
    }

    alert('Cuadro guardado correctamente')

    setFormCuadro({
      Nombre: '',
      Costo: '',
      Dimensiones: '',
      Medio: '',
      Foto: '',
      Stock: 1
    })

    cargarDatos()
  }

  async function actualizarCuadro(cuadro) {
    const nuevoCosto = prompt('Nuevo costo:', cuadro.Costo)
    const nuevoStock = prompt('Nuevo stock:', cuadro.Stock ?? 1)

    if (nuevoCosto === null || nuevoStock === null) {
      return
    }

    const { error } = await supabase
      .from('cuadros')
      .update({
        Costo: Number(nuevoCosto),
        Stock: Number(nuevoStock)
      })
      .eq('id_cuadro', cuadro.id_cuadro)

    if (error) {
      console.log(error)
      alert('No se pudo actualizar el cuadro')
      return
    }

    alert('Cuadro actualizado')
    cargarDatos()
  }

  async function eliminarCuadro(cuadro) {
    const confirmar = confirm(`¿Seguro que quieres eliminar "${cuadro.Nombre}"?`)

    if (!confirmar) {
      return
    }

    const { error } = await supabase
      .from('cuadros')
      .delete()
      .eq('id_cuadro', cuadro.id_cuadro)

    if (error) {
      console.log(error)
      alert('No se pudo eliminar el cuadro')
      return
    }

    alert('Cuadro eliminado')
    cargarDatos()
  }

  async function registrarVenta(cuadro) {
    const stockActual = Number(cuadro.Stock ?? 1)

    if (stockActual <= 0) {
      alert('No hay stock disponible para este cuadro')
      return
    }

    const metodoPago = prompt('Método de pago: efectivo, tarjeta o transferencia', 'efectivo')

    if (!metodoPago) {
      return
    }

    const total = Number(cuadro.Costo || 0)

    const { error: errorVenta } = await supabase
      .from('ventas')
      .insert([
        {
          Total: total,
          Hora: new Date().toISOString().slice(0, 10),
          Metodo_Pago: metodoPago,
          Nombre_Cuadro: cuadro.Nombre,
          id_cuadro: cuadro.id_cuadro
        }
      ])

    if (errorVenta) {
      console.log(errorVenta)
      alert('No se pudo registrar la venta')
      return
    }

    const { error: errorStock } = await supabase
      .from('cuadros')
      .update({
        Stock: stockActual - 1
      })
      .eq('id_cuadro', cuadro.id_cuadro)

    if (errorStock) {
      console.log(errorStock)
      alert('La venta se registró, pero no se pudo actualizar el stock')
      return
    }

    alert('Venta registrada correctamente')
    cargarDatos()
    setPantalla('ventas')
  }

  async function guardarArtista(e) {
    e.preventDefault()

    const nuevoArtista = {
      Nombre: formArtista.Nombre,
      Nacionalidad: formArtista.Nacionalidad,
      Nacimiento: formArtista.Nacimiento || null,
      Fallecimiento: formArtista.Fallecimiento || null,
      Foto: formArtista.Foto
    }

    const { error } = await supabase
      .from('artistas')
      .insert([nuevoArtista])

    if (error) {
      console.log(error)
      alert('No se pudo guardar el artista')
      return
    }

    alert('Artista guardado correctamente')

    setFormArtista({
      Nombre: '',
      Nacionalidad: '',
      Nacimiento: '',
      Fallecimiento: '',
      Foto: ''
    })

    cargarDatos()
  }

  if (!usuario) {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={iniciarSesion}>
          <h1>Galería de Arte</h1>
          <h2>Inicio de sesión</h2>

          <label>Correo</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="Ingresa tu correo"
            required
          />

          <label>Contraseña</label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            placeholder="Ingresa tu contraseña"
            required
          />

          <button type="submit">Iniciar sesión</button>

          {mensajeLogin && <p className="error">{mensajeLogin}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="app">
      <aside className="menu">
        <h2>Galería de Arte</h2>

        <button onClick={() => setPantalla('inicio')}>Inicio</button>
        <button onClick={() => setPantalla('galeria')}>Galería</button>
        <button onClick={() => setPantalla('ventas')}>Ventas</button>
        <button onClick={() => setPantalla('inventario')}>Inventario</button>
        <button onClick={() => setPantalla('artistas')}>Artistas</button>

        <button className="btn-salir" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </aside>

      <main className="contenido">
        {mensaje && <p>{mensaje}</p>}

        {pantalla === 'inicio' && (
          <section>
            <h1>Panel principal</h1>
            <p>Bienvenido, {usuario.Nombre}</p>

            <div className="resumen">
              <div className="resumen-card">
                <h3>{cuadros.length}</h3>
                <p>Cuadros registrados</p>
              </div>

              <div className="resumen-card">
                <h3>{artistas.length}</h3>
                <p>Artistas registrados</p>
              </div>

              <div className="resumen-card">
                <h3>{ventas.length}</h3>
                <p>Ventas registradas</p>
              </div>
            </div>

            <div className="perfil">
              <h2>Datos del usuario</h2>
              <p><strong>Nombre:</strong> {usuario.Nombre}</p>
              <p><strong>Apellido paterno:</strong> {usuario.ApellidoP}</p>
              <p><strong>Apellido materno:</strong> {usuario.ApellidoM}</p>
              <p><strong>Correo:</strong> {usuario.Correo}</p>
              <p><strong>Teléfono:</strong> {usuario.Telefono}</p>
            </div>
          </section>
        )}

        {pantalla === 'galeria' && (
          <section>
            <h1>Galería de cuadros</h1>

            <div className="grid">
              {cuadros.map((cuadro) => (
                <div className="card" key={cuadro.id_cuadro}>
                  <h3>{cuadro.Nombre}</h3>

                  {cuadro.Foto && (
                    <img
                      src={cuadro.Foto}
                      alt={cuadro.Nombre}
                      className="imagen-cuadro"
                    />
                  )}

                  <p><strong>Costo:</strong> ${cuadro.Costo}</p>
                  <p><strong>Dimensiones:</strong> {cuadro.Dimensiones}</p>
                  <p><strong>Medio:</strong> {cuadro.Medio}</p>
                  <p><strong>Stock:</strong> {cuadro.Stock ?? 1}</p>

                  <button onClick={() => registrarVenta(cuadro)}>
                    Vender
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {pantalla === 'ventas' && (
          <section>
            <h1>Ventas registradas</h1>

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cuadro</th>
                  <th>Total</th>
                  <th>Fecha</th>
                  <th>Método de pago</th>
                </tr>
              </thead>

              <tbody>
                {ventas.map((venta) => (
                  <tr key={venta.id_Venta}>
                    <td>{venta.id_Venta}</td>
                    <td>{venta.Nombre_Cuadro}</td>
                    <td>${venta.Total}</td>
                    <td>{venta.Hora}</td>
                    <td>{venta.Metodo_Pago}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {pantalla === 'inventario' && (
          <section>
            <h1>Inventario / Almacenamiento</h1>

            <form className="formulario" onSubmit={guardarCuadro}>
              <h2>Agregar nuevo cuadro</h2>

              <input
                type="text"
                placeholder="Nombre del cuadro"
                value={formCuadro.Nombre}
                onChange={(e) =>
                  setFormCuadro({ ...formCuadro, Nombre: e.target.value })
                }
                required
              />

              <input
                type="number"
                placeholder="Costo"
                value={formCuadro.Costo}
                onChange={(e) =>
                  setFormCuadro({ ...formCuadro, Costo: e.target.value })
                }
                required
              />

              <input
                type="text"
                placeholder="Dimensiones"
                value={formCuadro.Dimensiones}
                onChange={(e) =>
                  setFormCuadro({ ...formCuadro, Dimensiones: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Medio"
                value={formCuadro.Medio}
                onChange={(e) =>
                  setFormCuadro({ ...formCuadro, Medio: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="URL de imagen"
                value={formCuadro.Foto}
                onChange={(e) =>
                  setFormCuadro({ ...formCuadro, Foto: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Stock"
                value={formCuadro.Stock}
                onChange={(e) =>
                  setFormCuadro({ ...formCuadro, Stock: e.target.value })
                }
                required
              />

              <button type="submit">Guardar cuadro</button>
            </form>

            <h2>Cuadros existentes</h2>

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Costo</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {cuadros.map((cuadro) => (
                  <tr key={cuadro.id_cuadro}>
                    <td>{cuadro.id_cuadro}</td>
                    <td>{cuadro.Nombre}</td>
                    <td>${cuadro.Costo}</td>
                    <td>{cuadro.Stock ?? 1}</td>
                    <td>
                      <button onClick={() => actualizarCuadro(cuadro)}>
                        Editar
                      </button>

                      <button
                        className="btn-eliminar"
                        onClick={() => eliminarCuadro(cuadro)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {pantalla === 'artistas' && (
          <section>
            <h1>Artistas</h1>

            <form className="formulario" onSubmit={guardarArtista}>
              <h2>Agregar artista</h2>

              <input
                type="text"
                placeholder="Nombre del artista"
                value={formArtista.Nombre}
                onChange={(e) =>
                  setFormArtista({ ...formArtista, Nombre: e.target.value })
                }
                required
              />

              <input
                type="text"
                placeholder="Nacionalidad"
                value={formArtista.Nacionalidad}
                onChange={(e) =>
                  setFormArtista({
                    ...formArtista,
                    Nacionalidad: e.target.value
                  })
                }
              />

              <input
                type="date"
                value={formArtista.Nacimiento}
                onChange={(e) =>
                  setFormArtista({
                    ...formArtista,
                    Nacimiento: e.target.value
                  })
                }
              />

              <input
                type="date"
                value={formArtista.Fallecimiento}
                onChange={(e) =>
                  setFormArtista({
                    ...formArtista,
                    Fallecimiento: e.target.value
                  })
                }
              />

              <input
                type="text"
                placeholder="URL de foto"
                value={formArtista.Foto}
                onChange={(e) =>
                  setFormArtista({ ...formArtista, Foto: e.target.value })
                }
              />

              <button type="submit">Guardar artista</button>
            </form>

            <div className="grid">
              {artistas.map((artista) => (
                <div className="card" key={artista.id_Artista}>
                  <h3>{artista.Nombre}</h3>

                  {artista.Foto && (
                    <img
                      src={artista.Foto}
                      alt={artista.Nombre}
                      className="imagen-cuadro"
                    />
                  )}

                  <p><strong>Nacionalidad:</strong> {artista.Nacionalidad}</p>
                  <p><strong>Nacimiento:</strong> {artista.Nacimiento}</p>
                  <p><strong>Fallecimiento:</strong> {artista.Fallecimiento}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
