// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"

// Downloaded from https://www.forbes.com/digital-assets/assets/chudjak-chud/
import chudUrl from "./assets/chud.svg?no-inline";

//Setting up all of the game data and constants
interface UpgradeDef {
  id: string;
  name: string;
  baseCost: number;
  costGrowth: number;
  clickBonus: number;
  perSecond: number;
}

const UPGRADES: UpgradeDef[] = [
  {
    id: "clickPower",
    name: "Stronger Chud Click",
    baseCost: 10,
    costGrowth: 1.67,
    clickBonus: 1,
    perSecond: 0,
  },
  {
    id: "autoChudder",
    name: "Auto-Chudder",
    baseCost: 25,
    costGrowth: 1.67,
    clickBonus: 0,
    perSecond: 1,
  },
];

const CATCHPHRASES = [
  "Get your hands off me NPC!",
  "How about you go touch grass instead?",
  "Step back, I am a highvalue male!",
  "I knew you could see my inner alpha",
  "The West had fallen, billions must die",
  "Soy!",
  "Broooooootal",
  "Total *insert niche dislike* death",
  "Dancing app they said....",
  "Copium",
];

const BASE_CLICK_POWER = 1;
const GAMBLE_WIN_CHANCE = 0.5;

//Set up the game state and its logic, without touching the DOM
interface GameState {
  chuds: number;
  owned: Record<string, number>;
}

const state: GameState = {
  chuds: 0,
  owned: Object.fromEntries(UPGRADES.map((u) => [u.id, 0])),
};

function costOf(def: UpgradeDef): number {
  return Math.ceil(
    def.baseCost * Math.pow(def.costGrowth, state.owned[def.id]),
  );
}

function canAfford(def: UpgradeDef): boolean {
  return state.chuds >= costOf(def);
}

function chudsPerClick(): number {
  return UPGRADES.reduce(
    (sum, u) => sum + u.clickBonus * state.owned[u.id],
    BASE_CLICK_POWER,
  );
}

function chudsPerSecond(): number {
  return UPGRADES.reduce((sum, u) => sum + u.perSecond * state.owned[u.id], 0);
}

function purchase(def: UpgradeDef): boolean {
  if (!canAfford(def)) return false;
  state.chuds -= costOf(def);
  state.owned[def.id] += 1;
  return true;
}

function tick(seconds: number): void {
  state.chuds += chudsPerSecond() * seconds;
}

function gamble(): boolean {
  const won = Math.random() < GAMBLE_WIN_CHANCE;
  state.chuds = won ? state.chuds * 2 : 0;
  return won;
}

//Make all of the DOM elements and listeners
const app = document.querySelector<HTMLElement>("#app")!;

function makeButton(text: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

function makeParagraph(text = ""): HTMLParagraphElement {
  const p = document.createElement("p");
  p.textContent = text;
  return p;
}

const title = document.createElement("h1");
title.textContent = "Chud Clicker";

const image = document.createElement("img");
image.src = chudUrl;
image.alt = "The Chud mascot";
image.width = 500;
image.height = 500;

const hint = makeParagraph("It's time to chud out. Click me!");
const speech = makeParagraph();
const counter = makeParagraph();
const clickStat = makeParagraph();
const rateStat = makeParagraph();

function chudOut(withSpeech: boolean): void {
  state.chuds += chudsPerClick();
  hint.hidden = true;
  speech.textContent = withSpeech
    ? CATCHPHRASES[Math.floor(Math.random() * CATCHPHRASES.length)]
    : "";
}

image.addEventListener("click", () => chudOut(true));
const chudButton = makeButton("Chud Out!", () => chudOut(false));

const gambleButton = makeButton("Gamble for Chuds!", () => {
  speech.textContent = gamble()
    ? "Happy Chudmas! We've multiplied!"
    : "Nothing ever happens...";
});

const upgradeButtons = new Map<string, HTMLButtonElement>();
for (const def of UPGRADES) {
  upgradeButtons.set(def.id, makeButton("", () => purchase(def)));
}

function render(): void {
  const whole = Math.floor(state.chuds);
  counter.textContent = `${whole} ${whole === 1 ? "Chud" : "Chuds"}`;
  clickStat.textContent = `Chuds Per Click: ${chudsPerClick()}`;
  rateStat.textContent = `Chuds Per Second: ${chudsPerSecond()}`;

  for (const def of UPGRADES) {
    const button = upgradeButtons.get(def.id)!;
    button.textContent = `${def.name} (Costs ${costOf(def)} Chuds, Owned: ${
      state.owned[def.id]
    })`;
    button.disabled = !canAfford(def);
  }
}

//Main loop
let lastUpdate = performance.now();
function frame(now: number): void {
  tick((now - lastUpdate) / 1000);
  lastUpdate = now;
  render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

app.append(
  title,
  image,
  speech,
  hint,
  counter,
  chudButton,
  ...upgradeButtons.values(),
  gambleButton,
  clickStat,
  rateStat,
);
