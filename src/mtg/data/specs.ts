import type { P } from "./catalog";

export interface SpecRow {
  k: string;
  v: string;
}

/* ---------- per-series chipsets / displays / cameras so EVERY product shows its OWN specs ---------- */
const PHONE_CHIP: [RegExp, string][] = [
  [/iphone 17 pro max|iphone 17 pro/, "Apple A19 Pro (3 nm)"],
  [/iphone 17/, "Apple A19 (3 nm)"],
  [/iphone 16 pro/, "Apple A18 Pro (3 nm)"],
  [/iphone 16e|iphone 16/, "Apple A18 (3 nm)"],
  [/iphone 15 pro/, "Apple A17 Pro (3 nm)"],
  [/iphone 15/, "Apple A16 Bionic (4 nm)"],
  [/iphone 14/, "Apple A15 Bionic (5 nm)"],
  [/iphone 13/, "Apple A15 Bionic (5 nm)"],
  [/galaxy s26 ultra|galaxy s26/, "Qualcomm Snapdragon 8 Elite Gen 5 (3 nm)"],
  [/galaxy s25 ultra|galaxy s25/, "Qualcomm Snapdragon 8 Elite (3 nm)"],
  [/galaxy s24/, "Qualcomm Snapdragon 8 Gen 3 (4 nm)"],
  [/galaxy a16/, "MediaTek Dimensity 6300 (6 nm)"],
  [/redmi note|redmi \d/, "MediaTek Helio G99 / Dimensity 6100+"],
  [/moto g/, "Qualcomm Snapdragon 695 5G (6 nm)"],
  [/pixel 10/, "Google Tensor G5 (3 nm)"],
  [/pixel 9/, "Google Tensor G4 (4 nm)"],
  [/pixel/, "Google Tensor G3 (4 nm)"],
  [/magic v6|magic v5|magic 8/, "Snapdragon 8 Elite (3 nm)"],
  [/magic 7|magic v3/, "Snapdragon 8 Gen 3 (4 nm)"],
  [/honor 400 pro|honor 600 pro/, "Snapdragon 8 Gen 3 (4 nm)"],
  [/honor 400|honor 600/, "Snapdragon 7 Gen 3 (4 nm)"],
  [/honor x9|honor x8/, "Snapdragon 6 Gen 1 (4 nm)"],
  [/honor x7|honor x6|honor x5/, "MediaTek Helio G / Dimensity 6300"],
  [/honor 200/, "Snapdragon 7 Gen 3 (4 nm)"],
  [/honor/, "Snapdragon 7-series / Dimensity 7-series (4 nm)"],
  [/iqoo 13|iqoo 15/, "Snapdragon 8 Elite (3 nm)"],
  [/iqoo neo 10/, "Snapdragon 8s Gen 4 (4 nm)"],
  [/iqoo neo/, "Snapdragon 8 Gen 3 (4 nm)"],
  [/iqoo z10 turbo/, "Snapdragon 8s Gen 4 (4 nm)"],
  [/iqoo z10/, "Snapdragon 7s Gen 3 (4 nm)"],
  [/iqoo z9/, "Snapdragon 7 Gen 3 (4 nm)"],
  [/iqoo/, "Snapdragon 7-series (4 nm)"],
];

const PHONE_DISPLAY: [RegExp, string][] = [
  [/pro max|ultra/, "6.9 inches"],
  [/plus/, "6.7 inches"],
  [/pro\b/, "6.3 inches"],
  [/galaxy s\d\d\b|iphone 1\d\b/, "6.1 - 6.5 inches"],
  [/note|a16|g54|13c/, "6.6 - 6.74 inches"],
];

const PHONE_CAM: [RegExp, string][] = [
  [/iphone 17 pro|iphone 16 pro/, "48 MP (wide) + 48 MP (ultrawide) + 48 MP (tele 4x) | 4K@120fps HDR"],
  [/iphone 1\d pro/, "48 MP (wide) + 12 MP (ultrawide) + 12 MP (tele 3x) | 4K@60fps"],
  [/iphone/, "48 MP (wide) + 12 MP (ultrawide) | Dual-LED dual-tone flash | 4K@60fps"],
  [/ultra/, "200 MP (wide) + 50 MP (periscope 5x) + 12 MP (ultrawide) | 8K@30fps"],
  [/galaxy s/, "50 MP (wide) + 12 MP (ultrawide) + 10 MP (tele 3x) | 8K@30fps"],
  [/redmi|note|moto|pixel/, "50 MP (wide) + 2 MP (depth) | 1080p@60fps"],
];

const PHONE_BATT: [RegExp, string][] = [
  [/pro max|ultra/, "Li-Ion 4685 mAh | Wired 25W | Wireless 15W (MagSafe/Qi)"],
  [/plus/, "Li-Ion 4674 mAh | Wired 20W | Wireless 15W"],
  [/pro\b/, "Li-Ion 3582 mAh | Wired 20W | Wireless 15W"],
  [/galaxy s/, "Li-Ion 4000-5000 mAh | Wired 25W | Wireless 15W"],
  [/redmi|note|moto|pixel|13c|a16|g54/, "Li-Ion 5000 mAh | Wired 18-33W"],
  [/iphone/, "Li-Ion 3349 mAh | Wired 20W | Wireless 15W (MagSafe)"],
];

const LAP_CHIP: [RegExp, string][] = [
  [/m5 max/, "Apple M5 Max (16-core CPU / 40-core GPU)"],
  [/m5 pro/, "Apple M5 Pro (14-core CPU / 20-core GPU)"],
  [/m5/, "Apple M5 (10-core CPU / 10-core GPU)"],
  [/m4 max/, "Apple M4 Max (16-core CPU / 40-core GPU)"],
  [/m4 pro/, "Apple M4 Pro (12-core CPU / 16-core GPU)"],
  [/m4/, "Apple M4 (10-core CPU / 10-core GPU)"],
  [/m3/, "Apple M3 (8-core CPU / 10-core GPU)"],
  [/m2/, "Apple M2 (8-core CPU / 10-core GPU)"],
  [/neo/, "Apple M4 (10-core CPU / 10-core GPU)"],
];

const LAPTOP_CPU: [RegExp, string][] = [
  [/ultra 9/, "Intel Core Ultra 9 (Series 2)"],
  [/ultra 7/, "Intel Core Ultra 7 (Series 2)"],
  [/ultra 5/, "Intel Core Ultra 5 (Series 2)"],
  [/i9[- ]?1[34]\d{3}/, "13th/14th Gen Intel Core i9"],
  [/i7[- ]?1[34]\d{3}/, "13th/14th Gen Intel Core i7"],
  [/i5[- ]?1[34]\d{3}/, "13th/14th Gen Intel Core i5"],
  [/i3[- ]?1[234]\d{3}/, "12th/13th Gen Intel Core i3"],
  [/core i9|i9\b/, "Intel Core i9"],
  [/core i7|i7\b/, "Intel Core i7"],
  [/core i5|i5\b/, "Intel Core i5"],
  [/core i3|i3\b/, "Intel Core i3"],
  [/ryzen ai 9|ryzen 9/, "AMD Ryzen 9 / Ryzen AI 9"],
  [/ryzen 7/, "AMD Ryzen 7"],
  [/ryzen 5/, "AMD Ryzen 5"],
  [/ryzen 3/, "AMD Ryzen 3"],
  [/celeron|n100|n4020|n4500/, "Intel Celeron / N-series"],
  [/snapdragon/, "Snapdragon X Elite / Plus"],
];

const pick = (list: [RegExp, string][], name: string, fallback: string) =>
  list.find(([re]) => re.test(name))?.[1] ?? fallback;

export function getSpecs(p: P): SpecRow[] {
  const n = p.name.toLowerCase();
  const base: SpecRow[] = [
    { k: "Brand", v: p.brand ?? "Apple" },
    { k: "Model", v: p.name },
  ];

  const isPhone =
    /iphone|galaxy s|galaxy a|note \d|redmi|moto|pixel|honor|iqoo/.test(n) &&
    !/pen\b|pencil|stylus|\btab\b|pad\b|charger|cable|case|cover|watch|buds|power bank/.test(n);
  const isTab = /tab |tab-|ipad/.test(n);
  const isLaptop = /macbook/.test(n);
  const isWatch = /watch/.test(n);
  const isAudio = /buds|earbuds|airpods|headphone|speaker|earpods|bullets/.test(n);
  const isFan = /fan/.test(n);
  const isTv = /tv/.test(n);
  const isFryer = /fryer|cooker|blender|microwave|induction|hood/.test(n);

  if (isPhone)
    return [
      ...base,
      { k: "Network", v: "GSM / CDMA / HSPA / EVDO / LTE / 5G" },
      { k: "Dimensions", v: /pro max|ultra/.test(n) ? "163.4 × 78 × 8.2 mm" : "160.9 × 77.8 × 7.8 mm" },
      { k: "SIM", v: "Nano-SIM and eSIM - International" },
      { k: "Display Type", v: /iphone/.test(n) ? "Super Retina XDR OLED | HDR10 | Dolby Vision | 2000 nits (peak)" : "Dynamic AMOLED 2X | 120Hz | HDR10+ | 2600 nits" },
      { k: "Display Size", v: pick(PHONE_DISPLAY, n, "6.5 inches") },
      { k: "Chipset", v: pick(PHONE_CHIP, n, "Octa-core flagship chipset") },
      { k: "Display Resolution", v: /ultra|pro max/.test(n) ? "1440 × 3120 pixels" : "1290 × 2796 pixels" },
      { k: "CPU", v: /iphone/.test(n) ? "Hexa-core" : "Octa-core" },
      { k: "OS", v: /iphone/.test(n) ? "iOS 26, upgradable" : "Android 15, One UI 7" },
      { k: "Memory", v: /ultra|pro max/.test(n) ? "256GB | 512GB | 1TB" : "128GB | 256GB | 512GB" },
      { k: "Main Camera", v: pick(PHONE_CAM, n, "50 MP (wide) + 8 MP (ultrawide)") },
      { k: "Selfie Camera", v: /iphone 1[67]/.test(n) ? "18 MP (wide) | SL 3D | HDR, Cinematic mode" : "12 MP (wide) | HDR" },
      { k: "Sound", v: "Loudspeaker, stereo" },
      { k: "Battery Info", v: pick(PHONE_BATT, n, "Li-Ion 4500 mAh | Wired 25W") },
      { k: "Sensors", v: /iphone/.test(n) ? "Face ID, accelerometer, gyro, proximity, compass, barometer" : "Fingerprint (under display), accelerometer, gyro, compass" },
    ];

  if (isLaptop) {
    const size = n.match(/1[3456][- ]inch|1[3456]"/)?.[0] ?? (/15|16/.test(n) ? "14.2 / 16.2 inches" : "13.6 inches");
    return [
      ...base,
      { k: "Display", v: `${size} Liquid Retina${/pro/.test(n) ? " XDR (120Hz ProMotion)" : " (500 nits)"}` },
      { k: "Chipset", v: pick(LAP_CHIP, n, "Apple M-series") },
      { k: "Memory", v: /max|pro/.test(n) ? "24GB | 36GB | 48GB unified" : "8GB | 16GB | 24GB unified" },
      { k: "Storage", v: /neo/.test(n) ? "256GB | 512GB SSD" : "512GB | 1TB | 2TB SSD" },
      { k: "Graphics", v: `${pick(LAP_CHIP, n, "Apple M").match(/\d+-core GPU/)?.[0] ?? "10-core"} GPU | Hardware ray tracing` },
      { k: "Battery", v: /pro/.test(n) ? "Up to 22 hours video playback | 140W USB-C" : "Up to 18 hours video playback | 35W dual USB-C" },
      { k: "Ports", v: "Thunderbolt 4 / 5 ×3 | HDMI | SDXC | MagSafe 3" },
      { k: "OS", v: "macOS Sequoia" },
    ];
  }

  if (isTab)
    return [
      ...base,
      { k: "Display", v: /pro/.test(n) ? '11" / 13" Ultra Retina XDR (Tandem OLED)' : '10.9" / 11" Liquid Retina (500 nits)' },
      { k: "Chipset", v: /m5/.test(n) ? "Apple M5" : /m4/.test(n) ? "Apple M4" : /m3/.test(n) ? "Apple M3" : /tab s10/.test(n) ? "MediaTek Dimensity 9300+" : "Apple M-series / Snapdragon" },
      { k: "Memory", v: "128GB | 256GB | 512GB | 1TB" },
      { k: "Camera", v: "12 MP rear (4K) | 12 MP front ultra-wide (Center Stage)" },
      { k: "Battery", v: "8000-10000 mAh | 20-45W wired" },
      { k: "OS", v: /ipad/.test(n) ? "iPadOS 26" : "Android 15, One UI 7" },
    ];

  if (isWatch)
    return [
      ...base,
      { k: "Display", v: /ultra/.test(n) ? '2.1" LTPO3 AMOLED always-on (3000 nits)' : "1.96\" AMOLED always-on" },
      { k: "Chipset", v: /ultra 3/.test(n) ? "Apple S10 SiP" : "S-series SiP / MediaTek" },
      { k: "Battery", v: /ultra/.test(n) ? "Up to 72 hours (low power)" : "Up to 18 hours" },
      { k: "Water Resistance", v: /ultra/.test(n) ? "100 m + EN13319 dive" : "50 meters" },
      { k: "Connectivity", v: "Bluetooth 5.3 | UWB | GPS L1+L5 | LTE option" },
    ];

  if (isAudio)
    return [
      ...base,
      { k: "Type", v: /max/.test(n) ? "Over-ear Headphone" : /flip|speaker/.test(n) ? "Portable Speaker" : "TWS Earbuds" },
      { k: "ANC", v: /pro|nc|anc/.test(n) ? "Active Noise Cancellation (up to -48dB)" : "Passive isolation" },
      { k: "Driver", v: /max/.test(n) ? "40 mm dynamic" : "10-12.4 mm dynamic driver" },
      { k: "Battery", v: /speaker/.test(n) ? "12-14 hrs playtime | USB-C" : /pro/.test(n) ? "6 hrs + 24 hrs case | USB-C / Qi" : "5 hrs + 25 hrs case | USB-C" },
      { k: "Connectivity", v: "Bluetooth 5.3 | Multipoint | Low-latency mode" },
    ];

  if (isFan)
    return [
      ...base,
      { k: "Type", v: /handheld|mini/.test(n) ? "Handheld / Portable Fan" : "Rechargeable Table Fan" },
      { k: "Battery", v: /4000/.test(n) ? "4000 mAh Li-ion" : "1200-2000 mAh Li-ion" },
      { k: "Speed", v: "3-5 speed settings / 100-step turbo" },
      { k: "Runtime", v: "2-12 hours per charge" },
      { k: "Charging", v: "USB-C / USB-A 5V" },
    ];

  if (isTv)
    return [
      ...base,
      { k: "Screen", v: n.match(/\d\d ?inch|\d\d"/)?.[0] ?? "55 inches" },
      { k: "Panel", v: /qled|mini led/.test(n) ? "QD-Mini LED | 144Hz | HDR10+" : "QLED / LED | 60Hz | HDR10" },
      { k: "Resolution", v: /32/.test(n) ? "1366 × 768 HD Ready" : "3840 × 2160 4K UHD" },
      { k: "OS", v: "Google TV / Android 14" },
      { k: "Sound", v: "20-40W Dolby Audio | 2.0-2.1 ch" },
    ];

  if (isFryer)
    return [
      ...base,
      { k: "Capacity", v: n.match(/\d\.\d ?l/)?.[0] ?? "3.5-5 L" },
      { k: "Power", v: "1200-1700 W" },
      { k: "Technology", v: "Rapid Air / 360° hot circulation" },
      { k: "Control", v: "Digital touch / dial with timer" },
      { k: "Warranty", v: "1 year official service warranty" },
    ];

  /* ---- categories added from the real applegadgetsbd.com listings ---- */
  const mp = n.match(/(\d+)\s?mp/)?.[1];
  if (/\bnvr\b|network video recorder/.test(n))
    return [
      ...base,
      { k: "Channels", v: n.match(/(\d+)[ -]?(ch|channel)/)?.[1] ? `${n.match(/(\d+)[ -]?(ch|channel)/)![1]} Channel` : "8 Channel" },
      { k: "Max Resolution", v: /4k|8mp/.test(n) ? "Up to 8MP (4K)" : "Up to 6MP" },
      { k: "Storage", v: /2 ?sata|2hdd/.test(n) ? "2 × SATA HDD (up to 10TB each)" : "1 × SATA HDD (up to 10TB)" },
      { k: "PoE", v: /poe|-p\b|p\//.test(n) ? "Built-in PoE ports" : "Non-PoE" },
      { k: "Output", v: "HDMI + VGA, H.265+ compression" },
      { k: "Warranty", v: "1 year official warranty" },
    ];
  if (/\bdvr\b|xvr/.test(n))
    return [
      ...base,
      { k: "Channels", v: n.match(/(\d+)[ -]?(ch|channel)/)?.[1] ? `${n.match(/(\d+)[ -]?(ch|channel)/)![1]} Channel` : "4 Channel" },
      { k: "Video Input", v: "HDCVI / AHD / TVI / CVBS / IP hybrid" },
      { k: "Recording", v: /5mp|4k/.test(n) ? "Up to 5MP-N / 4K lite" : /1080|2mp/.test(n) ? "1080p Lite" : "720p / 1080N" },
      { k: "Storage", v: "1 × SATA HDD (up to 6TB)" },
      { k: "Compression", v: "H.265+ / H.264+" },
      { k: "Warranty", v: "1 year official warranty" },
    ];
  if (/package|kit\b/.test(n) && /camera|cctv|security/.test(n))
    return [
      ...base,
      { k: "Cameras", v: n.match(/(\d+)[ -]?(unit|pcs|camera)/)?.[1] ? `${n.match(/(\d+)[ -]?(unit|pcs|camera)/)![1]} × HD cameras` : "4 × HD cameras" },
      { k: "Recorder", v: /ip|nvr/.test(n) ? "NVR with PoE" : "Hybrid DVR / XVR" },
      { k: "Resolution", v: mp ? `${mp}MP` : "2MP Full HD" },
      { k: "Includes", v: "Cables, power supply, connectors & HDD bay" },
      { k: "Mobile View", v: "Live view & playback via app" },
      { k: "Warranty", v: "1 year official warranty" },
    ];
  if (/webcam/.test(n))
    return [
      ...base,
      { k: "Resolution", v: /4k/.test(n) ? "4K UHD @ 30fps" : /2k|1440/.test(n) ? "2K QHD @ 30fps" : "1080p Full HD @ 30fps" },
      { k: "Microphone", v: "Built-in dual noise-cancelling mics" },
      { k: "Focus", v: /auto ?focus|af\b/.test(n) ? "Auto focus" : "Fixed focus" },
      { k: "Connectivity", v: "USB-A plug & play" },
      { k: "Compatibility", v: "Windows / macOS / Android TV" },
    ];
  if (/gopro|insta360|osmo|action|sjcam|akaso/.test(n))
    return [
      ...base,
      { k: "Video", v: /8k/.test(n) ? "8K30 / 5.3K60" : /5\.3k|hero/.test(n) ? "5.3K60 / 4K120" : "4K60 / 2.7K120" },
      { k: "Photo", v: "27-72 MP stills" },
      { k: "Stabilisation", v: /insta360/.test(n) ? "FlowState + 360° horizon lock" : "HyperSmooth / RockSteady" },
      { k: "Waterproof", v: "10 m without housing" },
      { k: "Battery", v: "1720-1900 mAh Enduro" },
      { k: "Warranty", v: "1 year official warranty" },
    ];
  if (/camera|cam\b|tapo|ezviz|imou|hikvision|dahua/.test(n))
    return [
      ...base,
      { k: "Resolution", v: mp ? `${mp}MP (${mp === "2" ? "1080p" : mp === "4" ? "2K QHD" : mp === "5" ? "2.5K" : mp === "8" ? "4K UHD" : "HD"})` : "2MP Full HD" },
      { k: "Type", v: /ip|network|wifi|wi-fi|tapo|ezviz|imou/.test(n) ? (/wifi|wi-fi|tapo|ezviz|imou|c\d{3}/.test(n) ? "Wi-Fi smart camera" : "IP network camera (PoE)") : "HDCVI / analog camera" },
      { k: "Night Vision", v: /dual light|full color|wizcolor|color/.test(n) ? "Smart dual-light — full colour up to 30 m" : "IR night vision up to 30 m" },
      { k: "Audio", v: /audio|mic|two.?way|pt|pan/.test(n) ? "Built-in mic / two-way talk" : "Built-in mic" },
      { k: "Form Factor", v: /bullet/.test(n) ? "Bullet" : /dome|eyeball|turret/.test(n) ? "Dome / Eyeball" : /pt|pan/.test(n) ? "Pan & Tilt" : "Indoor / Outdoor" },
      { k: "Protection", v: /indoor|tapo c1|c2\d\d|ps3/.test(n) ? "Indoor use" : "IP67 weatherproof" },
      { k: "Warranty", v: "1 year official warranty" },
    ];
  if (/laptop|notebook|nitro|aspire|inspiron|vostro|latitude|thinkpad|ideapad|legion|loq|yoga|victus|pavilion|omen|envy|probook|elitebook|qbits/.test(n))
    return [
      ...base,
      { k: "Processor", v: pick(LAPTOP_CPU, n, "Intel Core / AMD Ryzen (latest gen)") },
      { k: "RAM", v: n.match(/(\d+)\s?gb\s?(ram|ddr)/)?.[1] ? `${n.match(/(\d+)\s?gb\s?(ram|ddr)/)![1]}GB DDR5` : /16gb/.test(n) ? "16GB DDR5" : "8GB DDR4/DDR5 (upgradable)" },
      { k: "Storage", v: /1tb/.test(n) ? "1TB NVMe SSD" : "512GB NVMe SSD" },
      { k: "Display", v: n.match(/(1[3-7](\.\d)?)["”\s-]*(inch|in\b|fhd|wuxga|oled)/)?.[1] ? `${n.match(/(1[3-7](\.\d)?)["”\s-]*(inch|in\b|fhd|wuxga|oled)/)![1]}" ${/oled/.test(n) ? "OLED" : /144hz|165hz/.test(n) ? "FHD 144Hz IPS" : "FHD IPS"}` : /oled/.test(n) ? "OLED display" : /15/.test(n) ? '15.6" FHD IPS' : '14" FHD IPS' },
      { k: "Graphics", v: n.match(/rtx\s?\d{4}/)?.[0] ? n.match(/rtx\s?\d{4}/)![0].toUpperCase() + " Laptop GPU" : "Integrated Intel Iris Xe / AMD Radeon" },
      { k: "Battery", v: "Up to 8-10 hours" },
      { k: "OS", v: "Windows 11 Home" },
      { k: "Warranty", v: "2 years official warranty" },
    ];
  if (/power ?bank|powerbank|mah/.test(n) && !/phone|pixel|honor|iqoo/.test(n))
    return [
      ...base,
      { k: "Capacity", v: n.match(/(\d{4,5})\s?mah/)?.[1] ? `${Number(n.match(/(\d{4,5})\s?mah/)![1]).toLocaleString("en-US")} mAh` : "10,000 mAh" },
      { k: "Output", v: n.match(/(\d{2,3})\s?w\b/)?.[1] ? `${n.match(/(\d{2,3})\s?w\b/)![1]}W max (USB-C PD + USB-A)` : "22.5W max (USB-C PD + USB-A)" },
      { k: "Wireless", v: /magnetic|magsafe|wireless/.test(n) ? "15W MagSafe-compatible wireless" : "—" },
      { k: "Input", v: "USB-C 20W fast recharge" },
      { k: "Safety", v: "Over-charge / short-circuit / temperature protection" },
      { k: "Warranty", v: "6-12 months official warranty" },
    ];
  if (/cable|lightning|type-c to|usb-c to|usb c to|hdmi/.test(n))
    return [
      ...base,
      { k: "Connector", v: /lightning/.test(n) ? "USB-C / USB-A to Lightning (MFi)" : /hdmi/.test(n) ? "HDMI 2.1 8K" : /c to c|c-c|type-c to type-c|usb-c to usb-c/.test(n) ? "USB-C to USB-C" : "USB-A to USB-C" },
      { k: "Power", v: n.match(/(\d{2,3})\s?w\b/)?.[1] ? `${n.match(/(\d{2,3})\s?w\b/)![1]}W PD fast charging` : "60W PD fast charging" },
      { k: "Length", v: n.match(/(\d(\.\d)?)\s?m\b/)?.[1] ? `${n.match(/(\d(\.\d)?)\s?m\b/)![1]} m` : "1 m" },
      { k: "Material", v: /braided|nylon/.test(n) ? "Braided nylon, 30,000+ bend tested" : "TPE, 10,000+ bend tested" },
      { k: "Data", v: "480 Mbps data sync" },
    ];
  if (/wireless charg|magsafe|3 in 1|3-in-1|2 in 1|charging stand|charging station/.test(n))
    return [
      ...base,
      { k: "Wireless Output", v: /magsafe|25w/.test(n) ? "Up to 15W MagSafe / Qi2" : "Up to 15W Qi" },
      { k: "Devices", v: /3 in 1|3-in-1/.test(n) ? "iPhone + Apple Watch + AirPods" : /2 in 1|2-in-1/.test(n) ? "iPhone + AirPods" : "Single device" },
      { k: "Input", v: "USB-C (adapter recommended 20-30W)" },
      { k: "Magnet", v: "N52 magnetic alignment" },
      { k: "Warranty", v: "6-12 months official warranty" },
    ];
  if (/charger|adapter|gan\b|\d{2,3}w/.test(n))
    return [
      ...base,
      { k: "Output", v: n.match(/(\d{2,3})\s?w\b/)?.[1] ? `${n.match(/(\d{2,3})\s?w\b/)![1]}W total` : "20W PD" },
      { k: "Ports", v: /dual|2 port|2-port/.test(n) ? "1 × USB-C + 1 × USB-A" : /3 port|3-port|triple/.test(n) ? "2 × USB-C + 1 × USB-A" : "1 × USB-C" },
      { k: "Technology", v: /gan/.test(n) ? "GaN III — compact & cool" : "PD 3.0 / PPS / QC 3.0" },
      { k: "Plug", v: "BD / EU / UK pin (as pictured)" },
      { k: "Safety", v: "Over-voltage, over-current & thermal protection" },
      { k: "Warranty", v: "6-12 months official warranty" },
    ];
  if (/plug|socket|power strip|extension/.test(n))
    return [
      ...base,
      { k: "Sockets", v: n.match(/(\d)\s?(ac|socket|outlet)/)?.[1] ? `${n.match(/(\d)\s?(ac|socket|outlet)/)![1]} × universal AC sockets` : "3 × universal AC sockets" },
      { k: "USB", v: /usb-c|type-c|pd/.test(n) ? "USB-C PD + USB-A fast charging" : "USB-A charging ports" },
      { k: "Rating", v: "2500W / 10A max" },
      { k: "Cord", v: n.match(/(\d(\.\d)?)\s?m\b/)?.[1] ? `${n.match(/(\d(\.\d)?)\s?m\b/)![1]} m` : "2 m" },
      { k: "Protection", v: "Surge & overload protection, fire-retardant shell" },
    ];
  if (/air conditioner|\bac\b|\bton\b/.test(n))
    return [
      ...base,
      { k: "Capacity", v: n.match(/(\d(\.\d)?)\s?ton/)?.[1] ? `${n.match(/(\d(\.\d)?)\s?ton/)![1]} Ton (${n.match(/(\d(\.\d)?)\s?ton/)![1] === "1" ? "12,000" : n.match(/(\d(\.\d)?)\s?ton/)![1] === "1.5" ? "18,000" : "24,000"} BTU)` : "1.5 Ton (18,000 BTU)" },
      { k: "Type", v: /inverter/.test(n) && !/non-inverter|non inverter/.test(n) ? "Inverter split AC" : "Non-inverter split AC" },
      { k: "Refrigerant", v: "R32 eco-friendly" },
      { k: "Features", v: "Turbo cooling, sleep mode, self-clean, timer" },
      { k: "Room Size", v: /2 ton/.test(n) ? "Up to 220 sq ft" : /1\.5/.test(n) ? "Up to 160 sq ft" : "Up to 120 sq ft" },
      { k: "Warranty", v: "10 years compressor, 1 year parts & service" },
    ];
  if (/pen\b|pencil|stylus/.test(n))
    return [
      ...base,
      { k: "Compatibility", v: /s pen|galaxy/.test(n) ? "Samsung Galaxy S / Tab series" : /apple pencil/.test(n) ? "iPad (USB-C / Pro / Air / mini)" : /honor|xiaomi/.test(n) ? "Honor / Xiaomi Pad" : "iPad 2018 & later" },
      { k: "Pressure", v: /pencil pro|s pen/.test(n) ? "4096 levels + tilt" : "Tilt sensitivity, palm rejection" },
      { k: "Battery", v: /s pen/.test(n) ? "Battery-free (EMR)" : "Up to 10-12 hours, USB-C / magnetic charging" },
      { k: "Tip", v: "Replaceable POM nibs" },
      { k: "Warranty", v: "6 months official warranty" },
    ];

  return [
    ...base,
    { k: "Category", v: "Gadget / Accessory" },
    { k: "Compatibility", v: "Universal (USB-C / Bluetooth 5.0+)" },
    { k: "Warranty", v: "Official brand warranty" },
    { k: "Country", v: "China / Vietnam" },
    { k: "Condition", v: "Brand new (sealed pack)" },
  ];
}

/* ---------- product-specific marketing copy ---------- */
export function getProductCopy(p: P): { paras: string[]; features: string[] } {
  const n = p.name;
  const b = p.brand ?? "Apple";
  const nl = n.toLowerCase();
  const cat = /iphone|galaxy s|galaxy a|note \d|redmi|moto|pixel|honor|iqoo|magic v|smart\b.*5g/.test(nl)
    ? "smartphone"
    : /macbook|laptop|notebook|nitro|aspire|inspiron|vostro|thinkpad|ideapad|legion|loq|victus|pavilion|omen|envy|probook|qbits/.test(nl)
    ? "laptop"
    : /nvr|dvr|xvr/.test(nl)
    ? "video recorder"
    : /gopro|insta360|osmo action|sjcam|akaso/.test(nl)
    ? "action camera"
    : /camera|cam\b|tapo|ezviz|imou/.test(nl)
    ? "security camera"
    : /air conditioner|\bton\b/.test(nl)
    ? "air conditioner"
    : /power ?bank|powerbank/.test(nl)
    ? "power bank"
    : /cable|hdmi/.test(nl)
    ? "cable"
    : /wireless charg|magsafe|charging stand|3 in 1|3-in-1/.test(nl)
    ? "wireless charger"
    : /charger|adapter|gan\b/.test(nl)
    ? "charger"
    : /plug|socket|power strip|extension/.test(nl)
    ? "power strip"
    : /pen\b|pencil|stylus/.test(nl)
    ? "stylus pen"
    : /tab|ipad/.test(nl)
    ? "tablet"
    : /watch/.test(nl)
    ? "smart watch"
    : /buds|earbuds|airpods|headphone|speaker|earpods/.test(nl)
    ? "audio gadget"
    : "gadget";

  const paras = [
    `The ${b} ${n} showcases an attractive and solid design, accompanied by a generously sized high-quality build that feels premium in hand. Its latest-generation processor ensures seamless performance, while its excellent optics and display capture every moment vividly. With an outstanding battery life, you can stay connected throughout the day without worrying about charging.`,
    `Inclusion of modern connectivity (USB-C / 5G / Bluetooth 5.3 depending on model) adds convenience to everyday use. Additionally, it offers essential safety and privacy features that could be crucial in life-saving situations, making the ${n} a versatile and reliable ${cat} choice for Bangladesh.`,
    `At Mr Tom Gadgets the ${n} is available with official warranty, EMI up to 36 months, exchange offer and fastest home delivery — order online or visit our outlets at Bashundhara City, Jamuna Future Park and Multiplan Center.`,
  ];

  const featureBank: Record<string, string[]> = {
    smartphone: [
      "Comprises with breathtaking colors with solid color-infused glass and aluminum",
      "A plus-size vibrant OLED display for a splendid visual experience",
      "Dynamic Island stays on the display and pops out with notifications and activities",
      "Flagship chipset incorporates advanced features to deliver flawless performance",
      "Great camera with telephoto lens and upgraded resolution to take excellent photos",
      "Optimized utility of the large battery takes the battery life to one whole day",
    ],
    laptop: [
      "Supercharged by the latest Apple Silicon for pro-level performance",
      "Liquid Retina display with P3 wide color and True Tone",
      "Up to 22 hours of battery life on a single charge",
      "Fanless / advanced thermal design stays cool and silent",
      "1080p FaceTime HD camera with studio-quality three-mic array",
      "Magic Keyboard with Touch ID and large Force Touch trackpad",
    ],
    tablet: [
      "Brilliant Liquid Retina display with ProMotion on Pro models",
      "Supports Apple Pencil Pro and Magic Keyboard",
      "All-day battery life for work, study and entertainment",
      "Center Stage front camera keeps you in frame on calls",
      "Landscape stereo speakers with rich sound",
    ],
    "smart watch": [
      "Always-on Retina display with up to 3000 nits brightness",
      "Advanced health sensors — ECG, blood oxygen, temperature",
      "Crash Detection and Fall Detection with Emergency SOS",
      "Water resistant for swimming and diving (model dependent)",
      "Seamless integration with iPhone and Apple ecosystem",
    ],
    "audio gadget": [
      "Immersive sound with custom high-excursion driver",
      "Active Noise Cancellation blocks outside noise (Pro models)",
      "Spatial Audio with dynamic head tracking",
      "Sweat and water resistant for workouts",
      "Long battery life with fast-charge support via USB-C",
    ],
    gadget: [
      "Premium build quality with compact portable design",
      "Fast and reliable performance for daily tasks",
      "Universal compatibility with modern devices",
      "Easy to carry and simple to operate",
      "Backed by official brand warranty",
    ],
  };

  return { paras, features: featureBank[cat] ?? featureBank.gadget };
}

/* ---------- option pills ---------- */
export interface OptGroup {
  title: string;
  opts: { label: string; dot?: string }[];
}

export function getOptionGroups(p: P): OptGroup[] {
  const n = p.name.toLowerCase();
  const isPhone = /iphone|galaxy|note \d|redmi|moto|pixel/.test(n);
  const isTab = /tab |tab-|ipad/.test(n);
  const isLaptop = /macbook/.test(n);
  const isDevice = isPhone || isTab || isLaptop;

  const groups: OptGroup[] = [];
  if (isDevice)
    groups.push({
      title: "Color:",
      opts: [
        { label: "Black", dot: "#1d1d1f" },
        { label: "Blue", dot: "#a8c3d8" },
        { label: "Green", dot: "#b7d8b0" },
        { label: "Pink", dot: "#eec6cf" },
        { label: "Yellow", dot: "#efe3b0" },
      ],
    });
  if (isDevice)
    groups.push({ title: "Region:", opts: [{ label: "EU" }, { label: "HK" }, { label: "IND" }, { label: "SG / UAE" }] });

  if (isPhone) groups.push({ title: "Storage:", opts: [{ label: "128GB" }, { label: "256GB" }, { label: "512GB" }] });
  else if (isTab) groups.push({ title: "Storage:", opts: [{ label: "64GB" }, { label: "128GB" }, { label: "256GB" }] });
  else if (isLaptop) groups.push({ title: "Storage:", opts: [{ label: "8/256GB" }, { label: "16/512GB" }, { label: "24/1TB" }] });
  else groups.push({ title: "Package:", opts: [{ label: "1 PCS Box" }, { label: "4 PCS Box" }] });

  return groups;
}
