let ProductAPI = `https://backend-inventory-tracking-system.onrender.com/products`;
let pageSize = 4;

function checkDiv(a, b) {
    return a % b == 0;
}

let totalPages = new Promise((resolve, reject) => {
    getProduct(function (data) {
        if (data.error) {
            reject('Supplier not found.');
        } else if (checkDiv(data.products.length, pageSize)) {
            resolve(Math.floor(data.products.length / pageSize));
        } else {
            resolve(Math.floor(data.products.length / pageSize) + 1);
        }
    });
});

function start() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        alert("Please, login");
        window.location.href = '/index.html'; // Redirect to login page
        return;
    }
    
    Promise.all([totalPages])
        .then(([totalPages]) => {
            paginateProduct(1, function (data) {
                console.log(totalPages);
                renderProduct(data.Product);
                renderPagination(totalPages, 1);
            });
            handleCreateForm();
        })
        .catch((error) => console.error(error));

    getCategories(function (data) {
        console.log(data);
        renderCategoriesInDropdown(data.categories);
    });

    let categorySelect = document.getElementById('product-category');
    if (categorySelect) {
        categorySelect.addEventListener('change', function () {
            let selectedCategory = categorySelect.value;
            console.log(selectedCategory);
            if (selectedCategory !== '') {
                queryProductsByCategory(selectedCategory, function (data) {
                    console.log(data.Product);
                    renderProduct(data.Product);
                });
            } else {
                getProduct(function (data) {
                    console.log(data.Product);
                    renderProduct(data.Product);
                });
            }
        });
    }
    loadWarehouseName();

    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem('authToken');
            alert("Logged out!");
            window.location.href = '/index.html'; // Redirect to login page
        };
    }
}

function paginateProduct(page, callback) {
    const authToken = localStorage.getItem('authToken');
    fetch(ProductAPI + `/paginate?page=${page}`,
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        }
    )
        .then(function (response) {
            return response.json();
        })
        .then(callback)
        .catch(function (error) {
            console.log(error);
        });
}

function getWarehouseDataByName(name, callback) {
    const authToken = localStorage.getItem('authToken');
    fetch(`https://backend-inventory-tracking-system.onrender.com/warehouse/${name}`,
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        }
    )
        .then(function (response) {
            return response.json();
        })
        .then(callback)
        .catch(function (error) {
            console.log(error);
        });
}

function getCategories(callback) {
    const authToken = localStorage.getItem('authToken');
    fetch('https://backend-inventory-tracking-system.onrender.com/category',
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        }
    )
        .then(function (response) {
            return response.json();
        })
        .then(callback)
        .catch(function (error) {
            console.log(error);
        });
}

let availableKeywords = [];
function loadWarehouseName() {
    const authToken = localStorage.getItem('authToken');
    fetch('https://backend-inventory-tracking-system.onrender.com/warehouse/warehouse-name',
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        }
    )
        .then(function (response) {
            return response.json();
        })
        .then(data => {
            availableKeywords = data.names;
            console.log(availableKeywords);
            const inputBox = document.getElementById('warehouse-name');
            const resultsBox = document.getElementById('results-box');

            if (inputBox && resultsBox) {
                inputBox.addEventListener('input', () => {
                    let filteredKeywords = [];
                    const query = inputBox.value.toLowerCase();
                    if (query.length) {
                        filteredKeywords = availableKeywords.filter(keyword => keyword.toLowerCase().includes(query));
                    }
                    console.log(filteredKeywords);
                    displayResults(filteredKeywords, resultsBox);

                    if (!filteredKeywords.length) {
                        resultsBox.innerHTML = '';
                    }
                });
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function displayResults(results, resultsBox) {
    console.log(results);
    if (results.length) {
        const content = results.map(item => `<li onclick="selectInput('${item}')">${item}</li>`).join('');
        resultsBox.innerHTML = `<ul>${content}</ul>`;
    }
}

function selectInput(value) {
    const inputBox = document.getElementById('warehouse-name');
    if (inputBox) {
        inputBox.value = value;
        const resultsBox = document.getElementById('results-box');
        if (resultsBox) {
            resultsBox.innerHTML = '';
        }
    }
}

function queryProductsByCategory(category, callback) {
    const authToken = localStorage.getItem('authToken');
    fetch(`https://backend-inventory-tracking-system.onrender.com/category/${category}`,
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        }
    )
        .then(function (response) {
            return response.json();
        })
        .then(callback)
        .catch(function (error) {
            console.log(error);
        });
}

function getProduct(callback) {
    const authToken = localStorage.getItem('authToken');
    fetch(ProductAPI,
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        }
    )
        .then(function (response) {
            return response.json();
        })
        .then(callback)
        .catch(function (error) {
            console.log(error);
        });
}

function createProduct(data, callback) {
    const authToken = localStorage.getItem('authToken');
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(data)
    };
    fetch(ProductAPI, options)
        .then(function (response) {
            console.log("create successful");
            console.log(data);
            return response.json();
        })
        .then(callback)
        .catch(function (error) {
            console.log(error);
        });
}

function queryProducts(name, callback) {
    const authToken = localStorage.getItem('authToken');
    fetch(ProductAPI + "/" + name,
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        }
    )
        .then(function (response) {
            return response.json();
        })
        .then(callback)
        .catch(function (error) {
            console.log(error);
        });
}

function renderPagination(totalPages, currentPage) {
    let paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        let button = document.createElement('button');
        button.textContent = i;
        button.classList.add('pagination-button');
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.onclick = (function (page) {
            console.log(page);
            return function () {
                paginateProduct(page, function (data) {
                    renderProduct(data.Product);
                    renderPagination(totalPages, page);
                });
            };
        })(i);
        paginationContainer.appendChild(button);
    }
}

function renderProduct(Products) {
    let listProductHTML = document.querySelector('.listProduct');

    listProductHTML.innerHTML = '';

    Products.forEach(product => {
        let newProduct = document.createElement('div');
        newProduct.classList.add('item');
        newProduct.innerHTML = `
            <h3>${product.name}</h3>
            <div class="title-price">Unit Price</div>
            <div class="price">${"$" + product.unit_price}</div>
            <nav>
                <button><a class="details" href="/details_products/details_product.html?product_id=${product.product_id}">DETAILS</a></button>
            </nav>
        `;
        listProductHTML.appendChild(newProduct);
    });

    let searchInput = document.querySelector('.search');
    if (searchInput) {
        searchInput.addEventListener('keyup', function (event) {
            if (event.keyCode === 13) {
                let searchQuery = searchInput.value.trim(); // Lấy giá trị từ ô tìm kiếm và loại bỏ khoảng trắng đầu cuối
                if (searchQuery === '') {
                    paginateProduct(1, function (data) {
                        renderProduct(data.Product);
                        renderPagination(totalPages, 1);
                    });
                } else {
                    queryProducts(searchQuery, function (data) {
                        renderProduct(data.Product);
                        renderPagination(totalPages, 1);
                    });
                }
            }
        });
    }
}

function renderCategoriesInDropdown(categories) {
    let categorySelect = document.getElementById('product-category');

    if (categorySelect) {
        categorySelect.innerHTML = '';
        categories.forEach(function (category) {
            let option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
}

function handleCreateForm() {
    let addButton = document.getElementById('add-Product');

    if (addButton) {
        addButton.addEventListener('click', function (event) {
            event.preventDefault();
            let name = document.querySelector('input[name="product-name"]').value;
            let category = document.querySelector('input[name="product-category"]').value;
            let unitPrice = parseFloat(document.querySelector('input[name="unit-price"]').value);
            let warehouseName = document.querySelector('input[name="warehouse-name"]').value;

            console.log(name);
            console.log(category);
            console.log(unitPrice);
            console.log(warehouseName);

            getWarehouseDataByName(warehouseName, function (data) {
                if (data.error) {
                    alert('Warehouse not found.');
                } else {
                    console.log(data.Warehouses[0]);
                    let warehouseId = data.Warehouses[0].warehouse_id;
                    let ProductForm = {
                        name: name,
                        category: category,
                        unit_price: unitPrice,
                        warehouse_id: warehouseId,
                        created_at: new Date().toLocaleString().slice(0, 19).replace("T", " "),
                        updated_at: new Date().toLocaleString().slice(0, 19).replace("T", " ")
                    };

                    createProduct(ProductForm, function () {
                        paginateProduct(1, function (data) {
                            console.log(data);
                            renderProduct(data.Product);
                        });
                    });
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', start);
