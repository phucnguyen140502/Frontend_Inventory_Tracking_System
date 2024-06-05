let ProductAPI = `https://backend-inventory-tracking-system.onrender.com/products`;
let pageSize = 4;

function checkDiv(a, b){
    return a%b==0;
}

let totalPages= new Promise((resolve, reject) => {
    getProduct(function(data) {
        if (data.error) {
            reject('Supplier not found.');
        } else if (checkDiv(data.products.length, pageSize)) {
            resolve(Math.floor(data.products.length / pageSize));
            } else {
            resolve(Math.floor(data.products.length / pageSize) + 1);
            }
    });
});
// Define the start function
function start() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        alert("Please, login")
        window.location.href = '/index.html'; // Redirect to login page
    }

    Promise.all([totalPages])
    .then(([totalPages]) => {
        paginateProduct(1, function(data) {
            console.log(totalPages);
            renderProduct(data.Product);
            renderPagination(totalPages, 1);
        });
        handleCreateForm();
    })

    getCategories(function(data) {
        console.log(data);
        renderCategoriesInDropdown(data.categories);
    });

    
    loadWarehouseName();

    const logoutBtn = document.querySelector(".logout-btn");

    // Handle logout
    logoutBtn.onclick = () => {
        localStorage.removeItem('authToken');
        alert("Logged out!");
        window.location.href = '/index.html'; // Redirect to login page
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
    .then(function(response) {
        return response.json();
    })
    .then(callback)
    .catch(function(error) {
        console.log(error);
    });
}

// Hàm để lấy dữ liệu warehouse từ server dựa trên tên
function getWarehouseDataByName(name, callback) {
    const authToken = localStorage.getItem('authToken');
    fetch("https://backend-inventory-tracking-system.onrender.com/warehouse/"+ name,
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        }
    )
        .then(function(response) {
            return response.json();
        })
        .then(callback)
        .catch(function(error) {
            console.log(error);
        });
}



function getCategories(callback) {
    const authToken = localStorage.getItem('authToken');
    fetch('https://backend-inventory-tracking-system.onrender.com/category', {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(function(data) {
        if (data.categories) {
            callback(data);
        } else {
            callback({ categories: [] });
        }
    })
    .catch(function(error) {
        console.error('Error fetching categories:', error);
        callback({ categories: [] });
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
        .then(function(response) {
            return response.json();
        })
        .then(data => {
            availableKeywords = data.names;
            console.log(availableKeywords);
            const inputBox = document.getElementById('warehouse-name');
            const resultsBox = document.getElementById('results-box');

            inputBox.addEventListener('input', () => {
                let filteredKeywords = [];
                const query = inputBox.value.toLowerCase();
                if(query.length){
                    filteredKeywords = availableKeywords.filter(keyword => keyword.toLowerCase().includes(query));
                }
                console.log(filteredKeywords);
                displayResults(filteredKeywords, resultsBox);

                if (!filteredKeywords.length) {
                    resultsBox.innerHTML = '';
                }
            });
        })
        .catch(function(error) {
            console.log(error);
        })
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
    inputBox.value = value;
    document.getElementById('results-box').innerHTML = '';
}

function queryProductsByCategory(category, callback) {
    const authToken = localStorage.getItem('authToken');
    fetch("https://backend-inventory-tracking-system.onrender.com/category" + "/" + category,
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        }
    )
        .then(function(response) {
            return response.json();
        })
        .then(callback)
        .catch(function(error) {
            console.log(error);
        });
}


// Define the function to fetch Product data from the server
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
        .then(function(response) {
            return response.json();
        })
        .then(callback)
        .catch(function(error) {
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
        .then(function(response) {
            console.log("create successful");
            console.log(data);
            return response.json();
        })
        .then(callback)
        .catch(function(error) {
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
        .then(function(response) {
            return response.json();
        })
        .then(callback)
        .catch(function(error) {
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
        button.onclick = (function(page) {
            console.log(page)
            return function() {
                paginateProduct(page, function(data) {
                    renderProduct(data.Product);
                    Promise.all([totalPages])
                    .then(([totalPages]) => {
                        renderPagination(totalPages, current);
                    })
                });
            };
        })(i);
        paginationContainer.appendChild(button);
    }
}

// Define the function to render Product data on the web page
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
        searchInput.addEventListener('keyup', function(event) {
            if (event.keyCode === 13) {
                // 13 là mã phím cho phím Enter
                let searchQuery = searchInput.value.trim(); // Lấy giá trị từ ô tìm kiếm và loại bỏ khoảng trắng đầu cuối
                if(searchQuery == ''){
                    paginateProduct(1, function(data) {
                        renderProduct(data.Product);
                        Promise.all([totalPages])
                        .then(([totalPages]) => {
                            renderPagination(totalPages, 1);
                        })
                        
                    });
                } else {
                    queryProducts(searchQuery, function(data) {
                        renderProduct(data.Product);
                        Promise.all([totalPages])
                        .then(([totalPages]) => {
                            renderPagination(totalPages, 1);
                        })
                    });
                }
            }
        });


}

function renderCategoriesInDropdown(categories) {
    let categorySelect = document.getElementById('product-category-selection');
    
    // Clear all existing options
    categorySelect.innerHTML = '';

    // Check if categories is an array and not null
    if (Array.isArray(categories) && categories.length > 0) {
        // Add an option for each category to the select
        categories.forEach(function(category) {
            let option = document.createElement('option');
            console.log(category);
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    } else {
        // Handle case where no categories are available
        let option = document.createElement('option');
        option.value = '';
        option.textContent = '';
        categorySelect.appendChild(option);
    }
}


// Thêm sự kiện cho nút thêm sản phẩm
function handleCreateForm() {
    let addButton = document.getElementById('add-Product');

    addButton.addEventListener('click', function() {
        event.preventDefault(); // Prevent the default form submission

        let name = document.querySelector('input[name="product-name"]').value;
        let category = document.querySelector('input[name="product-category"]').value; // Corrected to get the value from the dropdown
        let unitPrice = parseFloat(document.querySelector('input[name="unit-price"]').value);
        let warehouseName = document.getElementById('warehouse-name').value; // Changed to get the value from the input field
        console.log(name);
        console.log(category);
        console.log(unitPrice);
        console.log(warehouseName);
        // Gọi hàm để lấy thông tin warehouse dựa trên tên
        getWarehouseDataByName(warehouseName, function(data) {
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
                    created_at: new Date().toLocaleString().slice(0, 19).replace("T", " "), // Thêm giá trị thời gian hiện tại vào created_at
                    updated_at: new Date().toLocaleString().slice(0, 19).replace("T", " ") // Thêm giá trị thời gian hiện tại vào updated_at
                };

                // Tạo sản phẩm mới sau khi xác nhận
                createProduct(ProductForm, function() {
                    paginateProduct(1, function(data) {
                        console.log(data);
                        renderProduct(data.Product);
                        Promise.all([totalPages])
                        .then(([totalPages]) => {
                            renderPagination(totalPages, 1);
                        });
                    });
                });
            }
        });
    });
}



document.addEventListener('DOMContentLoaded', start);
