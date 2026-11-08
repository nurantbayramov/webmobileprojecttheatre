# Grand Aurora Theatre - Ticket Selection

A front-end ticket selection website for a theatre, made with HTML, CSS and JavaScript only.
Open `index.html` in a browser to use it (no server needed).

## The venue
- Type: theatre / auditorium with a stage at the top
- Sections: VIP Front, Orchestra Center, Orchestra Left, Orchestra Right, Box Left, Box Right, Balcony
- Seats: 464 in total
- Prices: VIP $120, Premium $85, Standard $60, Box $50, Economy $35

## What it does
- Seats are made with JavaScript from the `sections` and `categories` data in `script.js`
- Click a seat to see its details and price (this does not add it to the cart)
- Press ADD TO CART to add the seat; the same seat cannot be added twice
- Sold seats are greyed out and cannot be added
- The cart shows the seats, prices and total; seats can be removed (the map updates)
- The cart is saved in localStorage and is restored after a refresh
- Buttons for zoom in, zoom out, move up/down/left/right and reset view
- Bonus: mouse wheel zoom and click-and-drag to move the map (buttons still work)
- Works on small screens too

## How it is built
- `index.html` - page structure
- `style.css` - styles
- `script.js` - venue data, seat generation, cart and map controls

## Known issues
- None known.
