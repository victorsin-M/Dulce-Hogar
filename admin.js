document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const producto = {
        nombre: document.getElementById('nombre').value,
        precio: document.getElementById('precio').value,
        descripcion: document.getElementById('descripcion').value,
        imagen: document.getElementById('imagen').value
    };
    
    const response = await fetch('/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto)
    });
    
    const data = await response.json();
    alert('Producto agregado correctamente');
});

const actualizarStock = async (id) => {
    const nuevoStock = document.getElementById(`stock-${id}`).value;
    
    await fetch(`/productos/${id}/stock-update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: nuevoStock })
    });
    
    alert('Stock actualizado');
    cargarProductos();
}

const cargarProductos = async () => {
    const response = await fetch('/productos');
    const productos = await response.json();
    
    const lista = document.getElementById('lista-productos-admin');
    lista.innerHTML = '';
    productos.forEach(p => {
        lista.innerHTML += `
            <div>
                <span>${p.nombre}</span>
                <input type="number" value="${p.stock}" id="stock-${p.id}">
                <button onclick="actualizarStock(${p.id})">Actualizar</button>
            </div>
        `;
    });
}
cargarProductos();