const express = require('express');
const Database = require('better-sqlite3');
const db = new Database('tienda.db');

const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({ 
    accessToken: 'APP_USR-5252994434816819-041717-9b91fdce7fd76e86a5becd1570c89f67-3343079745'
});

db.exec(`
    CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        precio REAL,
        descripcion TEXT,
        imagen TEXT,
        stock INTEGER DEFAULT 10
    )
`);
const app = express();

app.use(express.json());
app.use(express.static('.'));

app.get('/productos', (req, res) => {
    const productos = db.prepare('SELECT * FROM productos').all();
    res.json(productos);
});

app.post('/productos', (req, res) => {
    const { nombre, precio, descripcion, imagen } = req.body;
    const stmt = db.prepare('INSERT INTO productos (nombre, precio, descripcion, imagen) VALUES (?, ?, ?, ?)');
    stmt.run(nombre, precio, descripcion, imagen);
    res.json({ mensaje: 'Producto agregado' });
});

const productosIniciales = [
    { nombre: 'Cupcake de Chocolate', precio: 45, descripcion: 'Delicioso cupcake de chocolate con glaseado de vainilla.', imagen: 'https://cdn.pixabay.com/photo/2017/05/07/08/56/cupcake-2291908_1280.jpg' },
    { nombre: 'Cupcake de Vainilla', precio: 45, descripcion: 'Suave cupcake de vainilla con glaseado de fresa.', imagen: 'https://sarasellos.com/wp-content/uploads/2024/05/cupcakes-vainilla-1-1024x1024.jpg' },
    { nombre: 'Cupcake de Fresa', precio: 45, descripcion: 'Delicioso cupcake de fresa con glaseado de chocolate.', imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSf65H21G_Q2BWrr8jcm92UF7id_js0Jch3GA&s' }
];

const count = db.prepare('SELECT COUNT(*) as total FROM productos').get();
if (count.total === 0) {
    const stmt = db.prepare('INSERT INTO productos (nombre, precio, descripcion, imagen) VALUES (?, ?, ?, ?)');
    productosIniciales.forEach(p => stmt.run(p.nombre, p.precio, p.descripcion, p.imagen));
}
app.patch('/productos/:id/stock-update', (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;
    db.prepare('UPDATE productos SET stock = ? WHERE id = ?').run(stock, id);
    res.json({ mensaje: 'Stock actualizado' });
});

app.post('/crear-pago', async (req, res) => {
    const { items } = req.body;
    
    const preference = new Preference(client);
    const result = await preference.create({
        body: {
            items: items.map(item => ({
                title: item.nombre,
                quantity: 1,
                unit_price: item.precio
            }))
        }
    });
    
    res.json({ init_point: result.init_point });
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

