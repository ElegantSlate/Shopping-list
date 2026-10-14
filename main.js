const STORAGE_KEY = 'shopping-list-items';
let items = loadItems();    
let editingId = null;        


const listEl = document.getElementById('items');
const formEl = document.getElementById('shopping-list');
const nameInputEl = document.getElementById('name');
const quantityInputEl = document.getElementById('quantity');
const priceInputEl = document.getElementById('price');
const totalEl = document.getElementById('total');
const clearBtnEl = document.getElementById('clear-btn');


function loadItems() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];         
    }
}

function saveItems() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
        
    }
}

function update() {
    saveItems();
    render();
}

function isValid(name, price, quantity) {
    return !(name === '' || isNaN(price) || isNaN(quantity) || price < 0 || quantity < 1);
}

function makeButton(label, action) {
    const button = document.createElement('button');
    button.textContent = label;
    button.dataset.action = action;
    return button;
}

function makeInput(type, className, value, label) {
    const input = document.createElement('input');
    input.type = type;
    input.className = className;
    input.value = value;
    input.setAttribute('aria-label', label);
    return input;
}


function updateTotal() {
    const total = items
        .filter(item => item.purchased)
        .reduce((sum, item) => sum + item.price * item.quantity, 0);

    totalEl.textContent = `Total: $${total.toFixed(2)}`;
}


function render() {
    listEl.innerHTML = '';
    updateTotal();

    if (items.length === 0) {
        const message = document.createElement('li');
        message.textContent = 'Nothing to see here yet.';
        listEl.appendChild(message);
        return;
    }

    items.forEach(item => {
        const li = document.createElement('li');
        li.dataset.id = item.id;

        if (item.purchased) {
            li.classList.add('purchased');
        }

        if (item.id === editingId) {
        
            const nameInput = makeInput('text', 'edit-name', item.name, 'Edit name');

            const priceInput = makeInput('number', 'edit-price', item.price, 'Edit price');
            priceInput.min = '0';
            priceInput.step = '0.01';

            const quantityInput = makeInput('number', 'edit-quantity', item.quantity, 'Edit quantity');
            quantityInput.min = '1';
            quantityInput.step = '1';

            li.append(
                nameInput,
                priceInput,
                quantityInput,
                makeButton('Save', 'save'),
                makeButton('Cancel', 'cancel')
            );
        } else {
        
            const text = document.createElement('span');
            text.textContent = `${item.name} - ${item.quantity} x $${item.price} `;

            li.append(
                text,
                makeButton(item.purchased ? 'Undo' : 'Mark purchased', 'toggle'),
                makeButton('Edit', 'edit'),
                makeButton('Delete', 'delete')
            );
        }

        listEl.appendChild(li);
    });
}

formEl.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = nameInputEl.value.trim();
    const price = parseFloat(priceInputEl.value);
    const quantity = parseInt(quantityInputEl.value);

    if (!isValid(name, price, quantity)) {
        return;
    }

    items.push({
        id: Date.now(),
        name: name,
        price: price,
        quantity: quantity,
        purchased: false
    });

    formEl.reset();
    nameInputEl.focus();
    update();
});

listEl.addEventListener('click', (e) => {
    const button = e.target.closest('[data-action]');

    if (!button) {
        return;
    }

    const li = button.closest('li');
    const id = Number(li.dataset.id);
    const action = button.dataset.action;

    if (action === 'toggle') {
        const item = items.find(i => i.id === id);
        item.purchased = !item.purchased;
        update();
    }

    if (action === 'delete') {
        items = items.filter(i => i.id !== id);
        if (editingId === id) {
            editingId = null;
        }
        update();
    }

    if (action === 'edit') {
        editingId = id;
        render();            
    }

    if (action === 'cancel') {
        editingId = null;
        render();
    }

    if (action === 'save') {
        const name = li.querySelector('.edit-name').value.trim();
        const price = parseFloat(li.querySelector('.edit-price').value);
        const quantity = parseInt(li.querySelector('.edit-quantity').value);

        if (!isValid(name, price, quantity)) {
            return;          
        }

        const item = items.find(i => i.id === id);
        item.name = name;
        item.price = price;
        item.quantity = quantity;
        editingId = null;
        update();
    }
});

clearBtnEl.addEventListener('click', () => {
    if (items.length === 0) {
        return;
    }

    if (confirm('Remove all items?')) {
        items = [];
        editingId = null;
        update();
    }
});

render();