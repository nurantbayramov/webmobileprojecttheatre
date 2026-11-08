// Grand Aurora Theatre - ticket selection
// All the venue info is stored in the objects below.
// The seats are NOT written in the HTML, they are made from this data later.

var SEAT_GAP = 26;      // distance from one seat to the next (px)
var AISLE = 14;         // extra space where there is an aisle (px)
var WORLD_W = 1200;     // size of the whole venue drawing
var WORLD_H = 740;
var STORAGE_KEY = "theatreCart";

// price categories
var categories = {
  vip:      { name: "VIP",      price: 120, color: "#b8860b" },
  premium:  { name: "Premium",  price: 85,  color: "#7c3aed" },
  standard: { name: "Standard", price: 60,  color: "#0e7490" },
  box:      { name: "Box",      price: 50,  color: "#be185d" },
  economy:  { name: "Economy",  price: 35,  color: "#4d7c0f" }
};

// sections of the theatre
// x, y = where the first seat starts, aisleAfter = put an aisle after this many seats
// sold = seats that are already taken
var sections = [
  { id: "VIP", name: "VIP Front",        category: "vip",      x: 437,  y: 130, rows: 3,  cols: 12, firstRow: "A", aisleAfter: 6,  sold: ["A1", "A12"] },
  { id: "OC",  name: "Orchestra Center", category: "premium",  x: 437,  y: 238, rows: 10, cols: 12, firstRow: "D", aisleAfter: 6,  sold: ["H6", "H7"] },
  { id: "OL",  name: "Orchestra Left",   category: "standard", x: 237,  y: 238, rows: 10, cols: 6,  firstRow: "D", aisleAfter: 0,  sold: [] },
  { id: "OR",  name: "Orchestra Right",  category: "standard", x: 807,  y: 238, rows: 10, cols: 6,  firstRow: "D", aisleAfter: 0,  sold: [] },
  { id: "BL",  name: "Box Left",         category: "box",      x: 70,   y: 238, rows: 8,  cols: 3,  firstRow: "A", aisleAfter: 0,  sold: ["A1"] },
  { id: "BR",  name: "Box Right",        category: "box",      x: 1052, y: 238, rows: 8,  cols: 3,  firstRow: "A", aisleAfter: 0,  sold: ["A3"] },
  { id: "BA",  name: "Balcony",          category: "economy",  x: 229,  y: 548, rows: 5,  cols: 28, firstRow: "N", aisleAfter: 14, sold: [] }
];

var stage = { x: 380, y: 20, width: 440, height: 70 };

// things the program keeps track of
var seats = [];          // every seat, filled by makeSeats()
var seatButtons = {};    // seat id -> its button on the page
var cart = [];           // ids of the seats in the cart
var selectedId = null;   // the seat that is being looked at
var justDragged = false; // used so dragging the map does not click a seat

// elements from the page
var viewport = document.getElementById("viewport");
var world = document.getElementById("world");
var legend = document.getElementById("legend");
var details = document.getElementById("details");
var addBtn = document.getElementById("add-to-cart");
var cartList = document.getElementById("cart-list");
var cartEmpty = document.getElementById("cart-empty");
var cartCount = document.getElementById("cart-count");
var cartTotal = document.getElementById("cart-total");
var clearBtn = document.getElementById("clear-cart");

function money(n) {
  return "$" + n;
}

// ---------- making the seats from the data ----------

function makeSeats() {
  for (var s = 0; s < sections.length; s++) {
    var sec = sections[s];
    var cat = categories[sec.category];

    for (var r = 0; r < sec.rows; r++) {
      var rowLetter = String.fromCharCode(sec.firstRow.charCodeAt(0) + r);

      for (var c = 0; c < sec.cols; c++) {
        var number = c + 1;
        var key = rowLetter + number;

        var x = sec.x + c * SEAT_GAP;
        if (sec.aisleAfter > 0 && c >= sec.aisleAfter) {
          x = x + AISLE;
        }
        var y = sec.y + r * SEAT_GAP;

        // a seat is sold if it is in the sold list, or by this little pattern
        var isSold = sec.sold.indexOf(key) !== -1 || (r * 5 + c * 3) % 11 === 0;

        seats.push({
          id: sec.id + "-" + key,
          sectionName: sec.name,
          category: sec.category,
          categoryName: cat.name,
          price: cat.price,
          row: rowLetter,
          number: number,
          x: x,
          y: y,
          available: !isSold
        });
      }
    }
  }
}

// find a seat object using its id
function findSeat(id) {
  for (var i = 0; i < seats.length; i++) {
    if (seats[i].id === id) {
      return seats[i];
    }
  }
  return null;
}

// small helper to make a div at a position
function makeBox(className, left, top, text) {
  var box = document.createElement("div");
  box.className = className;
  box.style.left = left + "px";
  box.style.top = top + "px";
  box.textContent = text;
  return box;
}

function drawVenue() {
  world.style.width = WORLD_W + "px";
  world.style.height = WORLD_H + "px";

  // stage
  var stageBox = makeBox("stage", stage.x, stage.y, "STAGE");
  stageBox.style.width = stage.width + "px";
  stageBox.style.height = stage.height + "px";
  world.appendChild(stageBox);

  // entrance
  var door = makeBox("entrance", 480, 700, "MAIN ENTRANCE");
  door.style.width = "240px";
  world.appendChild(door);

  // section names and row letters
  for (var s = 0; s < sections.length; s++) {
    var sec = sections[s];
    var price = categories[sec.category].price;
    world.appendChild(makeBox("section-label", sec.x, sec.y - 22, sec.name + " - " + money(price)));

    for (var r = 0; r < sec.rows; r++) {
      var letter = String.fromCharCode(sec.firstRow.charCodeAt(0) + r);
      world.appendChild(makeBox("row-label", sec.x - 20, sec.y + r * SEAT_GAP, letter));
    }
  }

  // the seats (one button each)
  for (var i = 0; i < seats.length; i++) {
    var seat = seats[i];
    var btn = document.createElement("button");
    btn.className = "seat";
    if (!seat.available) {
      btn.className = "seat unavailable";
    }
    btn.dataset.id = seat.id;
    btn.style.left = seat.x + "px";
    btn.style.top = seat.y + "px";
    btn.style.setProperty("--color", categories[seat.category].color);
    btn.title = seat.sectionName + ", Row " + seat.row + ", Seat " + seat.number + " - " + money(seat.price);
    btn.innerHTML = "<span>" + seat.number + "</span>";
    seatButtons[seat.id] = btn;
    world.appendChild(btn);
  }
}

// ---------- legend under the map ----------

function drawLegend() {
  var html = "";
  for (var name in categories) {
    var cat = categories[name];
    html += "<li><span class='swatch' style='--color:" + cat.color + "'></span>" + cat.name + " " + money(cat.price) + "</li>";
  }
  html += "<li><span class='swatch s-selected'></span>Selected</li>";
  html += "<li><span class='swatch s-cart'></span>In cart</li>";
  html += "<li><span class='swatch s-sold'></span>Unavailable</li>";
  legend.innerHTML = html;
}

// ---------- looking at a seat (inspect) ----------

// update how one seat looks on the map
function refreshSeat(id) {
  var btn = seatButtons[id];
  if (!btn) {
    return;
  }
  btn.classList.toggle("selected", selectedId === id);
  btn.classList.toggle("in-cart", cart.indexOf(id) !== -1);
}

// show the seat info in the details box (or the empty message if id is null)
function showDetails(id) {
  var seat = findSeat(id);

  if (!seat) {
    details.innerHTML = "<p class='muted'>No seat selected. Click a seat on the map.</p>";
    addBtn.disabled = true;
    addBtn.textContent = "ADD TO CART";
    return;
  }

  var inCart = cart.indexOf(id) !== -1;
  var status = "Available";
  var statusClass = "available";
  if (!seat.available) {
    status = "Unavailable";
    statusClass = "unavailable";
  } else if (inCart) {
    status = "In your cart";
    statusClass = "incart";
  }

  details.innerHTML =
    "<dl>" +
    "<dt>Section</dt><dd>" + seat.sectionName + "</dd>" +
    "<dt>Row</dt><dd>" + seat.row + "</dd>" +
    "<dt>Seat</dt><dd>" + seat.number + "</dd>" +
    "<dt>Category</dt><dd>" + seat.categoryName + "</dd>" +
    "<dt>Price</dt><dd class='price'>" + money(seat.price) + "</dd>" +
    "<dt>Status</dt><dd><span class='tag " + statusClass + "'>" + status + "</span></dd>" +
    "</dl>";

  // the button only works for free seats that are not in the cart yet
  addBtn.disabled = !seat.available || inCart;
  if (!seat.available) {
    addBtn.textContent = "SEAT UNAVAILABLE";
  } else if (inCart) {
    addBtn.textContent = "ALREADY IN CART";
  } else {
    addBtn.textContent = "ADD TO CART";
  }
}

function selectSeat(id) {
  var oldId = selectedId;
  selectedId = id;
  if (oldId) {
    refreshSeat(oldId);
  }
  refreshSeat(id);
  showDetails(id);
}

// clicking a seat ONLY selects it, it does not go in the cart
world.addEventListener("click", function (e) {
  if (justDragged) {
    return;
  }
  var btn = e.target.closest(".seat");
  if (btn) {
    selectSeat(btn.dataset.id);
  }
});

// ---------- cart ----------

function addToCart(id) {
  var seat = findSeat(id);
  if (!seat) {
    return;
  }
  if (!seat.available) {
    return;               // sold seats can never be added
  }
  if (cart.indexOf(id) !== -1) {
    return;               // already in the cart, no duplicates
  }

  cart.push(id);
  refreshSeat(id);
  drawCart();
  showDetails(id);
}

function drawCart() {
  cartList.innerHTML = "";
  var total = 0;

  for (var i = 0; i < cart.length; i++) {
    var seat = findSeat(cart[i]);
    total = total + seat.price;

    var li = document.createElement("li");
    var info = document.createElement("span");
    info.innerHTML = "<b>Row " + seat.row + ", Seat " + seat.number + "</b><br><small>" +
      seat.sectionName + " (" + seat.categoryName + ")</small>";
    var price = document.createElement("span");
    price.textContent = money(seat.price);

    li.appendChild(info);
    li.appendChild(price);
    cartList.appendChild(li);
  }

  cartEmpty.hidden = cart.length > 0;
  cartCount.textContent = cart.length;
  cartTotal.textContent = money(total);
}

// only the ADD TO CART button adds a seat
addBtn.addEventListener("click", function () {
  if (selectedId) {
    addToCart(selectedId);
  }
});

// ---------- start ----------
makeSeats();
drawVenue();
drawLegend();
drawCart();
showDetails(null);
