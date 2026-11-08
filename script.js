// theatre ticket page

var gap = 26;       // space between seats
var aisle = 14;     // extra gap for aisle
var W = 1200;
var H = 740;
var KEY = "theatreCart";

var types = {
  vip:      { name: "VIP",      price: 120, color: "#b8860b" },
  premium:  { name: "Premium",  price: 85,  color: "#7c3aed" },
  standard: { name: "Standard", price: 60,  color: "#0e7490" },
  box:      { name: "Box",      price: 50,  color: "#be185d" },
  economy:  { name: "Economy",  price: 35,  color: "#4d7c0f" }
};

// x,y is where the first seat goes. sold = taken seats
var sections = [
  { id: "VIP", name: "VIP Front",        type: "vip",      x: 437,  y: 130, rows: 3,  cols: 12, first: "A", aisleAfter: 6,  sold: ["A1", "A12"] },
  { id: "OC",  name: "Orchestra Center", type: "premium",  x: 437,  y: 238, rows: 10, cols: 12, first: "D", aisleAfter: 6,  sold: ["H6", "H7"] },
  { id: "OL",  name: "Orchestra Left",   type: "standard", x: 237,  y: 238, rows: 10, cols: 6,  first: "D", aisleAfter: 0,  sold: [] },
  { id: "OR",  name: "Orchestra Right",  type: "standard", x: 807,  y: 238, rows: 10, cols: 6,  first: "D", aisleAfter: 0,  sold: [] },
  { id: "BL",  name: "Box Left",         type: "box",      x: 70,   y: 238, rows: 8,  cols: 3,  first: "A", aisleAfter: 0,  sold: ["A1"] },
  { id: "BR",  name: "Box Right",        type: "box",      x: 1052, y: 238, rows: 8,  cols: 3,  first: "A", aisleAfter: 0,  sold: ["A3"] },
  { id: "BA",  name: "Balcony",          type: "economy",  x: 229,  y: 548, rows: 5,  cols: 28, first: "N", aisleAfter: 14, sold: [] }
];

var seats = [];
var btns = {};        // seat id -> button
var cart = [];        // seat ids
var selected = null;
var dragged = false;

var view = document.getElementById("viewport");
var world = document.getElementById("world");
var legend = document.getElementById("legend");
var details = document.getElementById("details");
var addBtn = document.getElementById("add-to-cart");
var cartList = document.getElementById("cart-list");
var emptyMsg = document.getElementById("cart-empty");
var countEl = document.getElementById("cart-count");
var totalEl = document.getElementById("cart-total");
var clearBtn = document.getElementById("clear-cart");

function money(n) {
  return "$" + n;
}

// ---------- seats ----------

function makeSeats() {
  for (var s = 0; s < sections.length; s++) {
    var sec = sections[s];
    var t = types[sec.type];

    for (var r = 0; r < sec.rows; r++) {
      var letter = String.fromCharCode(sec.first.charCodeAt(0) + r);

      for (var c = 0; c < sec.cols; c++) {
        var key = letter + (c + 1);

        var x = sec.x + c * gap;
        if (sec.aisleAfter > 0 && c >= sec.aisleAfter) {
          x += aisle;
        }

        // some random-looking seats are sold too
        var sold = sec.sold.indexOf(key) != -1 || (r * 5 + c * 3) % 11 == 0;

        seats.push({
          id: sec.id + "-" + key,
          section: sec.name,
          type: sec.type,
          typeName: t.name,
          price: t.price,
          row: letter,
          num: c + 1,
          x: x,
          y: sec.y + r * gap,
          free: !sold
        });
      }
    }
  }
}

function getSeat(id) {
  for (var i = 0; i < seats.length; i++) {
    if (seats[i].id == id) {
      return seats[i];
    }
  }
  return null;
}

function makeBox(cls, left, top, text) {
  var b = document.createElement("div");
  b.className = cls;
  b.style.left = left + "px";
  b.style.top = top + "px";
  b.textContent = text;
  return b;
}

function drawVenue() {
  world.style.width = W + "px";
  world.style.height = H + "px";

  var stage = makeBox("stage", 380, 20, "STAGE");
  stage.style.width = "440px";
  stage.style.height = "70px";
  world.appendChild(stage);

  var door = makeBox("entrance", 480, 700, "MAIN ENTRANCE");
  door.style.width = "240px";
  world.appendChild(door);

  // section names + row letters
  for (var s = 0; s < sections.length; s++) {
    var sec = sections[s];
    world.appendChild(makeBox("section-label", sec.x, sec.y - 22, sec.name + " - " + money(types[sec.type].price)));

    for (var r = 0; r < sec.rows; r++) {
      var letter = String.fromCharCode(sec.first.charCodeAt(0) + r);
      world.appendChild(makeBox("row-label", sec.x - 20, sec.y + r * gap, letter));
    }
  }

  for (var i = 0; i < seats.length; i++) {
    var seat = seats[i];
    var btn = document.createElement("button");
    btn.className = "seat";
    if (!seat.free) {
      btn.className = "seat unavailable";
    }
    btn.dataset.id = seat.id;
    btn.style.left = seat.x + "px";
    btn.style.top = seat.y + "px";
    btn.style.setProperty("--color", types[seat.type].color);
    btn.title = seat.section + ", Row " + seat.row + ", Seat " + seat.num + " - " + money(seat.price);
    btn.innerHTML = "<span>" + seat.num + "</span>";
    btns[seat.id] = btn;
    world.appendChild(btn);
  }
}

function drawLegend() {
  var html = "";
  for (var name in types) {
    var t = types[name];
    html += "<li><span class='swatch' style='--color:" + t.color + "'></span>" + t.name + " " + money(t.price) + "</li>";
  }
  html += "<li><span class='swatch s-selected'></span>Selected</li>";
  html += "<li><span class='swatch s-cart'></span>In cart</li>";
  html += "<li><span class='swatch s-sold'></span>Unavailable</li>";
  legend.innerHTML = html;
}

// ---------- picking a seat ----------

function updateSeat(id) {
  var btn = btns[id];
  if (!btn) {
    return;
  }
  btn.classList.toggle("selected", selected == id);
  btn.classList.toggle("in-cart", cart.indexOf(id) != -1);
}

function showDetails(id) {
  var seat = getSeat(id);

  if (!seat) {
    details.innerHTML = "<p class='muted'>No seat selected. Click a seat on the map.</p>";
    addBtn.disabled = true;
    addBtn.textContent = "ADD TO CART";
    return;
  }

  var inCart = cart.indexOf(id) != -1;
  var status = "Available";
  var cls = "available";
  var btnText = "ADD TO CART";

  if (!seat.free) {
    status = "Unavailable";
    cls = "unavailable";
    btnText = "SEAT UNAVAILABLE";
  } else if (inCart) {
    status = "In your cart";
    cls = "incart";
    btnText = "ALREADY IN CART";
  }

  details.innerHTML =
    "<dl>" +
    "<dt>Section</dt><dd>" + seat.section + "</dd>" +
    "<dt>Row</dt><dd>" + seat.row + "</dd>" +
    "<dt>Seat</dt><dd>" + seat.num + "</dd>" +
    "<dt>Category</dt><dd>" + seat.typeName + "</dd>" +
    "<dt>Price</dt><dd class='price'>" + money(seat.price) + "</dd>" +
    "<dt>Status</dt><dd><span class='tag " + cls + "'>" + status + "</span></dd>" +
    "</dl>";

  addBtn.disabled = !seat.free || inCart;
  addBtn.textContent = btnText;
}

function selectSeat(id) {
  var old = selected;
  selected = id;
  updateSeat(old);
  updateSeat(id);
  showDetails(id);
}

// clicking only selects, it does NOT add to cart
world.addEventListener("click", function (e) {
  if (dragged) {
    return;
  }
  var btn = e.target.closest(".seat");
  if (btn) {
    selectSeat(btn.dataset.id);
  }
});

document.addEventListener("keydown", function (e) {
  if (e.key == "Escape") {
    selectSeat(null);
  }
});

// ---------- cart ----------

function addToCart(id) {
  var seat = getSeat(id);
  if (!seat || !seat.free) {
    return;
  }
  if (cart.indexOf(id) != -1) {
    return;
  }

  cart.push(id);
  saveCart();
  updateSeat(id);
  drawCart();
  showDetails(id);
}

function removeFromCart(id) {
  var i = cart.indexOf(id);
  if (i == -1) {
    return;
  }
  cart.splice(i, 1);
  saveCart();
  updateSeat(id);
  drawCart();
  showDetails(selected);
}

function clearCart() {
  var old = cart;
  cart = [];
  saveCart();
  for (var i = 0; i < old.length; i++) {
    updateSeat(old[i]);
  }
  drawCart();
  showDetails(selected);
}

function drawCart() {
  cartList.innerHTML = "";
  var total = 0;

  for (var i = 0; i < cart.length; i++) {
    var seat = getSeat(cart[i]);
    total += seat.price;

    var li = document.createElement("li");

    var info = document.createElement("span");
    info.innerHTML = "<b>Row " + seat.row + ", Seat " + seat.num + "</b><br><small>" +
      seat.section + " (" + seat.typeName + ")</small>";

    var price = document.createElement("span");
    price.textContent = money(seat.price);

    var rm = document.createElement("button");
    rm.className = "remove";
    rm.textContent = "Remove";
    rm.dataset.id = seat.id;
    rm.addEventListener("click", function () {
      removeFromCart(this.dataset.id);
    });

    li.appendChild(info);
    li.appendChild(price);
    li.appendChild(rm);
    cartList.appendChild(li);
  }

  emptyMsg.hidden = cart.length > 0;
  countEl.textContent = cart.length;
  totalEl.textContent = money(total);
  clearBtn.disabled = cart.length == 0;
}

addBtn.addEventListener("click", function () {
  if (selected) {
    addToCart(selected);
  }
});

clearBtn.addEventListener("click", clearCart);

// ---------- localStorage ----------

function saveCart() {
  localStorage.setItem(KEY, JSON.stringify(cart));
}

function loadCart() {
  var data = [];
  try {
    data = JSON.parse(localStorage.getItem(KEY));
  } catch (e) {
    data = [];
  }
  if (!Array.isArray(data)) {
    return;
  }

  // skip ids that dont exist, sold seats and repeats
  for (var i = 0; i < data.length; i++) {
    var seat = getSeat(data[i]);
    if (seat && seat.free && cart.indexOf(seat.id) == -1) {
      cart.push(seat.id);
    }
  }
}

// ---------- zoom and move ----------

var scale = 1;
var mapX = 0;
var mapY = 0;
var moved = false;    // did the user move the map yet

function showView() {
  var vw = view.clientWidth;
  var vh = view.clientHeight;
  var keep = 100;     // dont let the map leave the screen completely

  if (mapX > vw - keep) { mapX = vw - keep; }
  if (mapX < keep - W * scale) { mapX = keep - W * scale; }
  if (mapY > vh - keep) { mapY = vh - keep; }
  if (mapY < keep - H * scale) { mapY = keep - H * scale; }

  world.style.transform = "translate(" + mapX + "px, " + mapY + "px) scale(" + scale + ")";
}

function resetView() {
  var vw = view.clientWidth;
  var vh = view.clientHeight;
  scale = Math.min(vw / W, vh / H) * 0.96;
  mapX = (vw - W * scale) / 2;
  mapY = (vh - H * scale) / 2;
  moved = false;
  showView();
}

function zoomAt(factor, px, py) {
  var s = scale * factor;
  if (s < 0.35) { s = 0.35; }
  if (s > 3) { s = 3; }

  mapX = px - (px - mapX) * (s / scale);
  mapY = py - (py - mapY) * (s / scale);
  scale = s;
  moved = true;
  showView();
}

function moveView(dx, dy) {
  mapX += dx;
  mapY += dy;
  moved = true;
  showView();
}

function zoomMiddle(factor) {
  zoomAt(factor, view.clientWidth / 2, view.clientHeight / 2);
}

document.getElementById("zoom-in").addEventListener("click", function () { zoomMiddle(1.25); });
document.getElementById("zoom-out").addEventListener("click", function () { zoomMiddle(1 / 1.25); });
// up button = see whats above, so map goes down
document.getElementById("move-up").addEventListener("click", function () { moveView(0, 90); });
document.getElementById("move-down").addEventListener("click", function () { moveView(0, -90); });
document.getElementById("move-left").addEventListener("click", function () { moveView(90, 0); });
document.getElementById("move-right").addEventListener("click", function () { moveView(-90, 0); });
document.getElementById("reset-view").addEventListener("click", resetView);

// bonus: mouse wheel zoom
view.addEventListener("wheel", function (e) {
  e.preventDefault();
  var box = view.getBoundingClientRect();
  zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - box.left, e.clientY - box.top);
}, { passive: false });

// bonus: drag to move
var down = false;
var dragging = false;
var startX = 0;
var startY = 0;
var lastX = 0;
var lastY = 0;

view.addEventListener("pointerdown", function (e) {
  if (e.button != 0) {
    return;
  }
  down = true;
  dragging = false;
  startX = lastX = e.clientX;
  startY = lastY = e.clientY;
});

window.addEventListener("pointermove", function (e) {
  if (!down) {
    return;
  }
  // tiny movement is just a click
  if (!dragging) {
    if (Math.abs(e.clientX - startX) < 5 && Math.abs(e.clientY - startY) < 5) {
      return;
    }
    dragging = true;
    view.classList.add("dragging");
  }
  moveView(e.clientX - lastX, e.clientY - lastY);
  lastX = e.clientX;
  lastY = e.clientY;
});

window.addEventListener("pointerup", function () {
  if (!down) {
    return;
  }
  down = false;
  view.classList.remove("dragging");
  if (dragging) {
    // stop the click that comes right after the drag from selecting a seat
    dragged = true;
    setTimeout(function () { dragged = false; }, 0);
  }
});

window.addEventListener("resize", function () {
  if (moved) {
    showView();
  } else {
    resetView();
  }
});

// ---------- start ----------

makeSeats();
drawVenue();
drawLegend();
loadCart();
for (var k = 0; k < cart.length; k++) {
  updateSeat(cart[k]);
}
drawCart();
showDetails(null);
resetView();
