// All text and data for Ember Roast (a concept site: brand, products and prices are samples).

export const nav = {
  links: [
    { label: "The café", href: "#top" },
    { label: "Our beans", href: "#origins" },
    { label: "The pour", href: "#pour" },
    { label: "The menu", href: "#menu" },
    { label: "Bakes", href: "#bakes" },
    { label: "Take home", href: "#beans" },
    { label: "Visit", href: "#visit" },
  ],
  status: "Open now · till 11 pm",
  todaysPour: { label: "Today's pour", value: "Araku Valley, washed", note: "Jasmine, stone fruit, raw honey" },
  hours: ["Mon–Fri · 7:30 am – 11 pm", "Sat–Sun · 8 am – midnight"],
};

export const hero = {
  frames: "/frames/ember-hero",
  framesPhone: "/frames/ember-hero-m", // centre-cut portrait frames (560 × 1080) for phones
  eyebrow: "Specialty coffee · Roastery · Hyderabad",
  title: ["Walk in.", "*Slow down.*"],
  text: "Single-origin Indian coffee, roasted every morning in Jubilee Hills and brewed by hand.",
  buttons: [
    { label: "See the menu", href: "#menu" },
    { label: "Visit us", href: "#visit" },
  ],
  note: "Open today · 7:30 am – 11 pm",
  captions: ["Roasted in Hyderabad,\nevery morning.", "Pull up a *chair.*"],
};

export const statement = {
  eyebrow: "From hill to cup",
  text: "We buy from four Indian estates, roast every morning and brew every cup by hand.",
};

export type Origin = {
  name: string;
  estate: string;
  altitude: string;
  process: string;
  notes: string[];
  image: string;
  lon: number;
  lat: number;
};

export const origins = {
  eyebrow: "Our beans",
  title: ["Four hills.", "*One roaster.*"],
  text: "Every bag starts on a hillside in the south, picked ripe and shipped to our roaster in Hyderabad.",
  roastery: { name: "Ember Roastery, Hyderabad", lon: 78.47, lat: 17.39 },
  items: [
    { name: "Chikmagalur", estate: "Kalasa Ridge Estate", altitude: "1,450 m", process: "Washed", notes: ["Cocoa", "Orange peel", "Jaggery"], image: "/images/ember/origin-chikmagalur.webp", lon: 75.77, lat: 13.32 },
    { name: "Coorg", estate: "Misty Fold Estate", altitude: "1,150 m", process: "Honey", notes: ["Plum", "Brown sugar", "Clove"], image: "/images/ember/origin-coorg.webp", lon: 75.74, lat: 12.42 },
    { name: "Nilgiris", estate: "Blue Hill Estate", altitude: "1,700 m", process: "Anaerobic", notes: ["Red wine", "Cherry", "Cacao nib"], image: "/images/ember/origin-nilgiris.webp", lon: 76.7, lat: 11.41 },
    { name: "Araku Valley", estate: "Valley Co-op Farms", altitude: "1,100 m", process: "Washed", notes: ["Jasmine", "Stone fruit", "Honey"], image: "/images/ember/origin-araku.webp", lon: 82.87, lat: 18.33 },
  ] satisfies Origin[],
};

export const roast = {
  eyebrow: "The roast",
  title: ["How dark", "*do you like it?*"],
  stops: [
    { name: "Green", sub: "Before the fire", time: "0 min", temp: "24 °C", notes: "Grassy, raw and hard as a pebble. This is where every bean starts.", best: "Not for brewing yet", image: "/images/ember/roast-green.webp" },
    { name: "Light", sub: "First crack", time: "9 min", temp: "205 °C", notes: "Bright and floral: jasmine, citrus, tea-like body.", best: "Best for pour-over", image: "/images/ember/roast-light.webp" },
    { name: "Medium", sub: "Just after first crack", time: "11 min", temp: "218 °C", notes: "Round and sweet: caramel, cocoa, a little fruit.", best: "Best for espresso", image: "/images/ember/roast-medium.webp" },
    { name: "Ember", sub: "Our house dark", time: "13 min", temp: "228 °C", notes: "Deep and smoky: dark chocolate, molasses, toasted spice.", best: "Best with milk", image: "/images/ember/roast-dark.webp" },
  ],
};

export const pour = {
  frames: "/frames/ember-pour",
  framesPhone: "/frames/ember-pour-m", // centre-cut frames (750 × 900) for phones
  eyebrow: "Signature · The pour",
  title: ["Brewed *by hand.*", "Three slow minutes."],
  recipe: ["18 g coffee", "250 g water", "93 °C", "medium-fine"],
  total: { seconds: 180, grams: 250 },
  steps: [
    { at: "0:00", name: "Bloom", detail: "50 g of water wakes the grounds up" },
    { at: "0:45", name: "First pour", detail: "Slow spirals up to 150 g" },
    { at: "1:30", name: "Second pour", detail: "Up to 250 g, keep it steady" },
    { at: "2:15", name: "Drawdown", detail: "Let the last drops fall through" },
    { at: "3:00", name: "Serve", detail: "Swirl, pour, slow down" },
  ],
};

export type MenuItem = { name: string; note: string; price: number };

export const menu = {
  eyebrow: "The menu",
  title: ["Something warm,", "*something slow.*"],
  pages: [
    {
      tab: "Espresso bar",
      image: "/images/ember/menu-espresso.webp",
      items: [
        { name: "Espresso", note: "Ember house blend, 36 g in 28 seconds", price: 160 },
        { name: "Cortado", note: "Equal parts espresso and warm milk", price: 200 },
        { name: "Flat white", note: "Double ristretto, silky milk", price: 230 },
        { name: "Cappuccino", note: "Thick foam, a dust of cocoa", price: 220 },
        { name: "Honey cardamom latte", note: "Wild honey, green cardamom", price: 260 },
        { name: "Kerala cocoa mocha", note: "70% single-estate chocolate", price: 270 },
      ],
    },
    {
      tab: "Pour-over",
      image: "/images/ember/menu-pourover.webp",
      items: [
        { name: "Araku Valley", note: "Washed · jasmine, stone fruit", price: 290 },
        { name: "Chikmagalur", note: "Washed · cocoa, orange peel", price: 280 },
        { name: "Coorg", note: "Honey process · plum, brown sugar", price: 300 },
        { name: "Nilgiris", note: "Anaerobic · red wine, cherry", price: 340 },
        { name: "Flight of three", note: "Three small cups, side by side", price: 480 },
      ],
    },
    {
      tab: "Cold",
      image: "/images/ember/menu-cold.webp",
      items: [
        { name: "18-hour cold brew", note: "Chikmagalur, steeped overnight", price: 240 },
        { name: "Filter kaapi tonic", note: "Chicory brew, tonic, orange", price: 260 },
        { name: "Iced flat white", note: "Double shot over cold milk", price: 250 },
        { name: "Coconut cold brew", note: "Tender coconut water, cold brew", price: 270 },
        { name: "Espresso lemonade", note: "Fresh lime, a little sugar", price: 230 },
      ],
    },
    {
      tab: "Bakes",
      image: "/images/ember/bake-croissant.webp",
      items: [
        { name: "Cardamom bun", note: "Glazed, still warm at 8 am", price: 160 },
        { name: "Brown-butter croissant", note: "72 layers, baked in-house", price: 210 },
        { name: "Jaggery banana bread", note: "With salted butter", price: 180 },
        { name: "Filter-coffee tiramisu", note: "Our decoction, mascarpone", price: 290 },
        { name: "Ghee-roast cookie", note: "Crisp edges, soft middle", price: 120 },
      ],
    },
  ] satisfies { tab: string; image: string; items: MenuItem[] }[],
};

export const bakes = {
  eyebrow: "Fresh bakes",
  title: ["Out of the oven", "*at 8.*"],
  text: "Baked in our own oven every morning, in small batches, until they run out.",
  items: [
    { name: "Cardamom bun", note: "Soft, glazed, green cardamom", price: 160, out: "Out at 8 am", image: "/images/ember/bake-bun.webp" },
    { name: "Brown-butter croissant", note: "Flaky, nutty, 72 layers", price: 210, out: "Out at 8 am", image: "/images/ember/bake-croissant.webp" },
    { name: "Jaggery banana bread", note: "Warm slice, salted butter", price: 180, out: "Out at 12 pm", image: "/images/ember/bake-bananabread.webp" },
    { name: "Filter-coffee tiramisu", note: "Made with our decoction", price: 290, out: "Out at 12 pm", image: "/images/ember/bake-tiramisu.webp" },
  ],
};

export type Bag = { origin: string; roast: string; roastLevel: number; notes: string; price: number; label: string; ink: string };

export const beans = {
  eyebrow: "Take home",
  title: ["Take the café", "*home.*"],
  text: "Roasted this week, packed the same day. 250 g bags, ground the way you brew.",
  bagImage: "/images/ember/bag-kraft.webp",
  grinds: ["Whole bean", "Espresso", "Pour-over", "French press"],
  items: [
    { origin: "Araku Valley", roast: "Light", roastLevel: 1, notes: "Jasmine · stone fruit · honey", price: 790, label: "#f4e9d8", ink: "#2a1a10" },
    { origin: "Chikmagalur", roast: "Medium", roastLevel: 2, notes: "Cocoa · orange peel · jaggery", price: 650, label: "#e0913f", ink: "#1b120c" },
    { origin: "Coorg", roast: "Medium", roastLevel: 2, notes: "Plum · brown sugar · clove", price: 720, label: "#cdbd9c", ink: "#2a1a10" },
    { origin: "Ember House", roast: "Ember dark", roastLevel: 4, notes: "Dark chocolate · molasses · spice", price: 690, label: "#2e1f15", ink: "#f4e9d8" },
  ] satisfies Bag[],
};

export const stay = {
  eyebrow: "Stay a while",
  title: ["Stay", "*a while.*"],
  text: "For laptops, first dates and long chats. Nobody will rush you.",
  photos: [
    { image: "/images/ember/stay-window.webp", label: "The window seat", note: "Quiet corner till noon" },
    { image: "/images/ember/stay-table.webp", label: "The long table", note: "Fast Wi-Fi · plugs at every seat" },
    { image: "/images/ember/stay-roaster.webp", label: "The roaster", note: "Roasting days: Tue & Fri" },
  ],
};

export const club = {
  eyebrow: "Ember Club",
  title: "Fresh beans, every two weeks.",
  perks: ["From ₹1,190 / month", "Your first cup on us", "Students 10% off with ID"],
  button: "Join the club",
  image: "/images/ember/menu-flatwhite.webp",
};

export const reviews = {
  eyebrow: "Notes from regulars",
  title: ["Kind words,", "*printed fresh.*"],
  items: [
    { order: [["Flat white", 230], ["Cardamom bun", 160]], text: "My Tuesday office. Great Wi-Fi, better flat whites, and nobody minds if I stay till lunch.", name: "Meera", who: "UX designer, works here Tuesdays" },
    { order: [["Pour-over, Araku", 290], ["Pour-over, Coorg", 300]], text: "We come every Sunday and try a new pour-over. The baristas remember our names now.", name: "Arjun & Sana", who: "Sunday regulars" },
    { order: [["Cold brew", 240], ["Banana bread", 180]], text: "Cheapest good coffee near campus, and the banana bread is unreal. Student discount helps.", name: "Karthik", who: "Final-year student" },
    { order: [["Beans, Ember House", 690]], text: "Bought a bag after the roastery tour. My mornings at home finally taste like this place.", name: "Farah", who: "Takes the beans home" },
  ] as { order: [string, number][]; text: string; name: string; who: string }[],
};

export const visit = {
  eyebrow: "Visit",
  title: ["Come in", "*slow.*"],
  area: "Jubilee Hills, Hyderabad",
  hours: [
    ["Mon – Fri", "7:30 am – 11 pm"],
    ["Sat – Sun", "8 am – midnight"],
    ["Roastery tours", "Saturdays, 10 am"],
  ],
  extras: ["Window seats", "Work tables", "Pet friendly", "Beans to take home"],
  buttons: [
    { label: "Order ahead", href: "#menu" },
    { label: "Get directions", href: "#visit" },
  ],
};

export const footer = {
  wordmark: "Ember Roast",
  columns: [
    { title: "Café", links: ["The menu", "Fresh bakes", "Stay a while", "Visit"] },
    { title: "Beans", links: ["Single origins", "Ember Club", "Brew guides", "Gift a bag"] },
    { title: "Follow", links: ["Instagram", "Spotify playlist", "Newsletter"] },
  ],
  note: "Concept website by Triozen Tech. Ember Roast is an invented brand; products and prices are samples.",
};
