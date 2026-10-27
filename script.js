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
