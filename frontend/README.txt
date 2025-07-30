
INSTRUCCIONES PARA AÑADIR 'CREAR TICKET' EN EL PROYECTO EXISTENTE (MANTENIENDO MENÚ LATERAL):

1) En tu archivo index.html, dentro de la función cargarAvisos, cambia la línea de botones por:

<td>
  <button onclick='editarAviso(${JSON.stringify(a)})'>✏️</button>
  <button onclick='borrarAviso(${a.id})'>🗑️</button>
  <button onclick='abrirModalTicket(${JSON.stringify(a)})'>🎫</button>
</td>

2) Añade al final de tu <script> en index.html:

function abrirModalTicket(aviso){
  const modal=document.getElementById("modal");
  modal.innerHTML=\`
  <div class='modal'>
    <h3>Crear Ticket</h3>
    <p><strong>Cliente:</strong> \${aviso.cliente}</p>
    <p><strong>Observaciones:</strong> \${aviso.tarea}</p>
    <input id='fechaTicket' type='date' value='\${new Date().toISOString().split('T')[0]}'><br>
    <select id='tecnicoTicket'>
      \${tecnicos.map(t=>\`<option \${t.nombre===aviso.tecnico?'selected':''}>\${t.nombre}</option>\`).join("")}
    </select><br>
    <select id='estadoTicket'>
      <option value="Pausado">Pausado</option>
      <option value="Cerrado">Cerrado</option>
      <option value="Facturado">Facturado</option>
    </select><br><br>
    <button onclick='guardarModalTicket(\${aviso.id})'>Guardar Ticket</button>
    <button onclick='cerrarModal()'>Cancelar</button>
  </div>\`;
  modal.style.display="block";
}

function cerrarModal(){
  document.getElementById("modal").style.display="none";
}

async function guardarModalTicket(avisoId){
  const data={
    aviso_id: avisoId,
    fecha: document.getElementById('fechaTicket').value,
    tecnico: document.getElementById('tecnicoTicket').value,
    estado: document.getElementById('estadoTicket').value
  };
  await fetch(api+"/tickets",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(data)
  });
  cerrarModal();
  alert('Ticket creado correctamente');
}
