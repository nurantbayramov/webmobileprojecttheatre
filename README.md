# Grand Aurora Theatre - Ticket Page

Ticket selection page for a theatre. Made with plain HTML, CSS and JavaScript. Just open `index.html` in a browser.

## Venue
- Theatre with a stage at the top
- 7 sections: VIP Front, Orchestra Center, Orchestra Left, Orchestra Right, Box Left, Box Right, Balcony
- 464 seats
- Prices: VIP $120, Premium $85, Standard $60, Box $50, Economy $35

## What it does
- Seats are made by JavaScript from the `sections` data in `script.js` (none are written in the HTML)
- Click a seat to see its details and price, this does not add it to the cart
- Press ADD TO CART to add it (same seat can't be added twice, sold seats can't be added)
- Cart shows seats, prices and total, and you can remove seats
- Cart is saved in localStorage so it is still there after refresh
- Buttons for zoom in/out, move up/down/left/right and reset
- Bonus: mouse wheel zoom and drag to move the map (buttons still work)
- Works on phone sized screens

## Files
- `index.html` - the page
- `style.css` - styles
- `script.js` - venue data, cart and map controls

## How I tested it
- click a seat: details show up and the cart stays the same
- add the same seat twice: only one ticket
- remove a ticket: the seat on the map changes back
- refresh: cart and seat colors come back
- click a sold seat: add button is disabled
- all zoom / move / reset buttons, plus wheel zoom and dragging
- different browser widths (desktop, tablet, phone)

## Known issues
- On a phone the map starts zoomed in, use the - button to see the whole venue
- No pinch zoom on touch screens (use the + / - buttons)
