// Celebrity database — accurate physical descriptions for AI prompt injection.
// Descriptions are in English so the model can process them directly.
// When a celebrity name is detected in a user prompt, their description is
// prepended as a CELEBRITY APPEARANCE REFERENCE so the model generates
// their authentic likeness rather than an invented generic face.

export type Celebrity = {
  id: string;
  name: string;
  aliases: string[];
  gender: "male" | "female" | "duo" | "group";
  category: string;
  nationality: string;
  visual_description: string;
  /** One stable public photo URL (legacy single-image support) */
  reference_image_url?: string;
  /** Multiple reference photo URLs — fetched from Supabase Storage celebrity-refs/{id}/ */
  reference_images?: string[];
};

export const CELEBRITY_DB: Celebrity[] = [

  // ──────────────────────────────────────────────────────────────────────────
  // DIVERTISSEMENT / HUMOUR (FRANCE)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "squeezie",
    name: "Squeezie",
    aliases: ["gabriel squeezio", "gabriel didal"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French YouTuber (music, gaming, concepts). Male, ~1.65m, slim but slightly muscular. Ash-blonde hair, blue eyes, fair skin. Youthful juvenile face. Oversized streetwear: hoodies, graphic tees, caps.",
  },
  {
    id: "michou",
    name: "Michou",
    aliases: ["mickaël vendetta", "mickael vendetta"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French vlogger (humor, dance). Male, ~1.75m, slim dynamic build. Platinum blonde hair, brown eyes, three-day stubble. Colorful relaxed style: flashy sweaters, sneakers.",
  },
  {
    id: "inoxtag",
    name: "Inoxtag",
    aliases: ["inox", "inoxydable"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French YouTuber (extreme challenges, adventure). Male, ~1.80m, athletic sporty build. Medium-length brown hair, green eyes, olive skin. Angular face. Sports or casual outdoor wear.",
  },
  {
    id: "amixem",
    name: "Amixem",
    aliases: ["florian fedérico", "florian federico"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French YouTuber (humor, gaming, vlogs). Male, ~1.78m, average build. Brown hair, hazel eyes, full thick beard. Relaxed boho-chic look: shirts, casual blazers.",
  },
  {
    id: "mcfly",
    name: "McFly",
    aliases: ["mcfly carlito", "bryan mahe", "mcfly et carlito"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French comedian duo McFly & Carlito. Male, ~1.75m, normal build. Bald head, dark brown beard, brown eyes. Casual: jeans, t-shirt. Mischievous smile.",
  },
  {
    id: "carlito",
    name: "Carlito",
    aliases: ["carlito mcfly", "alexis patry", "mcfly et carlito"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French comedian duo McFly & Carlito. Male, ~1.80m, slightly heavy build. Long brown hair tied back, beard, light eyes. Casual: denim jacket, bandana.",
  },
  {
    id: "mister-v",
    name: "Mister V",
    aliases: ["yvick letexier", "mistervofficial", "mister v"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French comedian and actor of Cameroonian descent. Male, ~1.85m, athletic build. Mixed race, short curly black hair, brown eyes. Streetwear: baggy pants, gold chain. Discreet tattoos.",
  },
  {
    id: "seb",
    name: "Seb",
    aliases: ["seb du sud", "sebastien du sud", "seb la frite"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French humor YouTuber. Male, ~1.72m, slim. Brown hair, green eyes. Chill look: shorts, t-shirt, cap. Fine face, small beard.",
  },
  {
    id: "theodort",
    name: "Théodort",
    aliases: ["theodort", "theo dort"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French hidden-camera and humor YouTuber. Male, ~1.70m, slim energetic silhouette. Brown hair, brown eyes, thick eyebrows. Young: Adidas tracksuit, cap.",
  },
  {
    id: "just-riadh",
    name: "Just Riadh",
    aliases: ["riadh", "riadh belaiche", "riadh belaïche"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French storytelling and humor creator. Male, ~1.78m, normal build. Mixed race, wavy black hair, brown eyes. Neat beard. Urban look: long coat, sneakers.",
  },
  {
    id: "sundy-jules",
    name: "Sundy Jules",
    aliases: ["sundy", "sundy jules"],
    gender: "male",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French lifestyle and fashion male creator. ~1.82m, slim and elegant. Bleached blonde hair, blue eyes. Fashion style: fitted jacket, wide-leg trousers. Angular face, bright white smile.",
  },
  {
    id: "natoo",
    name: "Natoo",
    aliases: ["natasha", "natoo youtube"],
    gender: "female",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French humor and sketch creator. Female, ~1.65m, curvy build. Brown hair, hazel eyes, long hair often tied up. Quirky colorful look. Very expressive face.",
  },
  {
    id: "cyprien",
    name: "Cyprien",
    aliases: ["cyprien iov"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French humor YouTuber (less active). Male, ~1.70m, slim. Brown hair, brown eyes. Few-days beard, sometimes glasses. Simple: jeans, sweater.",
  },
  {
    id: "norman",
    name: "Norman",
    aliases: ["norman thavaud"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French humor vlogger (less active). Male, ~1.65m, small build. Brown hair, brown eyes. Casual hoodie and t-shirt. Round face, goofy smile.",
  },
  {
    id: "pierre-croce",
    name: "Pierre Croce",
    aliases: ["pierre croce"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French stand-up comedian and YouTuber. Male, ~1.75m, normal build. Brown hair, brown eyes, short beard, styled hair. Smart-casual: jacket, shirt.",
  },
  {
    id: "joyca",
    name: "Joyca",
    aliases: ["joris cantin"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French humor, gaming and vlog creator. Male, ~1.80m, slim. Blonde hair, blue eyes. Colorful: pink sweater, sneakers. Fine face, mischievous look.",
  },
  {
    id: "mastu",
    name: "Mastu",
    aliases: ["mastuvu"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French humor and gaming YouTuber. Male, ~1.78m, average build. Brown hair, brown eyes, beard, glasses. Geek-chic hooded sweatshirt.",
  },
  {
    id: "lebouseuh",
    name: "LeBouseuh",
    aliases: ["bouseuh", "le bouseuh"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French humor, gaming and challenge streamer. Male, ~1.75m, sporty build. Brown hair, brown eyes. Street: cap, jogging. Round face, mocking smile.",
  },
  {
    id: "valouzz",
    name: "Valouzz",
    aliases: ["valouz"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French humor vlogger. Male, ~1.77m, normal build. Brown hair, brown eyes. Relaxed: t-shirt, jeans. Nascent beard.",
  },
  {
    id: "pidi",
    name: "Pidi",
    aliases: ["pidi streamer"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French gaming humor creator. Male, ~1.70m, slim. Blonde hair, blue eyes. Young: sweatshirt, beanie. Baby-faced appearance.",
  },
  {
    id: "doc-jazy",
    name: "Doc Jazy",
    aliases: ["docjazy"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French humor and music creator. Male, ~1.75m, normal build. Brown hair, brown eyes, beard, sometimes long hair. Rock look: leather jacket.",
  },
  {
    id: "le-grand-jd",
    name: "Le Grand JD",
    aliases: ["grand jd", "jean dragan"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French comedian and chronicler. Male, ~1.80m, average build. Brown hair, brown eyes, beard. Casual-chic look.",
  },
  {
    id: "poisson-fecond",
    name: "Poisson Fécond",
    aliases: ["poisson fecond"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French absurdist humor YouTuber. Male, ~1.70m, slim. Brown hair, brown eyes. Quirky: round glasses, vintage coat.",
  },
  {
    id: "le-rire-jaune",
    name: "Le Rire Jaune",
    aliases: ["rire jaune"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French parody and humor YouTuber. Male, ~1.75m, normal build. Brown hair, brown eyes. Simple look, cap.",
  },
  {
    id: "le-roi-des-rats",
    name: "Le Roi des Rats",
    aliases: ["roi des rats", "roiderats"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French absurd humor streamer. Male, ~1.72m, slim. Brown hair, brown eyes. Dark style: black clothing, piercing.",
  },
  {
    id: "antoine-daniel",
    name: "Antoine Daniel",
    aliases: ["antoinedaniel"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French media critic and humor creator. Male, ~1.80m, normal build. Brown hair, brown eyes, beard. Intellectual: glasses, shirt.",
  },
  {
    id: "le-monde-a-lenvers",
    name: "Le Monde à l'Envers",
    aliases: ["monde a lenvers"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French parody humor YouTuber. Male, ~1.78m, normal build. Brown hair, brown eyes. Relaxed casual style.",
  },
  {
    id: "maxestla",
    name: "MaxEstLa",
    aliases: ["max est la"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French humor vlogger. Male, ~1.75m, slim. Blonde hair, blue eyes. Young casual: sweatshirt, cap.",
  },
  {
    id: "le-tatou",
    name: "Le Tatou",
    aliases: ["le tatou youtube"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French prank and hidden-camera YouTuber. Male, ~1.70m, stocky build. Brown hair, brown eyes. Street: big sneakers.",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // LIFESTYLE / BEAUTÉ (FRANCE)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "lena-situations",
    name: "Léna Situations",
    aliases: ["lena situations", "léna mahfouf", "lena mahfouf"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French fashion vlogger and author. Female, ~1.58m, slim. Brown hair, brown eyes, mid-length with bangs. Modern Parisian: blazer, jeans, ankle boots. Fine face, fair skin.",
  },
  {
    id: "romy",
    name: "Romy",
    aliases: ["romy influencer", "romy fr"],
    gender: "female",
    category: "fr_beauty",
    nationality: "fr",
    visual_description:
      "French beauty and lifestyle creator. Female, ~1.65m, slim. Blonde hair, blue eyes, long wavy hair. Glamorous: fitted dress, heels. Soft face, full lips.",
  },
  {
    id: "paola-locatelli",
    name: "Paola Locatelli",
    aliases: ["paola"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French mixed-race actress and lifestyle creator. Female, ~1.70m, slim. Brown curly hair, hazel eyes. Fashion structured pieces. High cheekbones, bright smile.",
  },
  {
    id: "mayadorable",
    name: "Mayadorable",
    aliases: ["maya adorable", "maya"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French humor and lifestyle creator. Female, ~1.60m, normal build. Brown hair, brown eyes, long hair. Natural minimal-makeup look, jeans. Round face, friendly.",
  },
  {
    id: "sananas",
    name: "Sananas",
    aliases: ["sanam wae", "sanam waé"],
    gender: "female",
    category: "fr_beauty",
    nationality: "fr",
    visual_description:
      "French beauty creator. Female, ~1.65m, slim. Brown hair, green eyes, long straight hair. Sophisticated: blazer, scarf. Fine face, fair skin.",
  },
  {
    id: "enjoy-phoenix",
    name: "EnjoyPhoenix",
    aliases: ["enjoyphoenix", "marie lopez"],
    gender: "female",
    category: "fr_beauty",
    nationality: "fr",
    visual_description:
      "French beauty, wellness and cooking creator. Female, ~1.70m, normal build. Blonde hair, blue eyes, mid-length hair. Soft pastel style: flowy dresses. Angelic face.",
  },
  {
    id: "shera-kerienski",
    name: "Shera Kerienski",
    aliases: ["shera"],
    gender: "female",
    category: "fr_beauty",
    nationality: "fr",
    visual_description:
      "French beauty and body-positive creator. Female, ~1.68m, curvy build. Mixed race, brown curly hair, brown eyes. Assertive: fitted outfits, vivid colors. Full cheeks, wide smile.",
  },
  {
    id: "carla-ginola",
    name: "Carla Ginola",
    aliases: ["carla ginola"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French fashion and luxury influencer. Female, ~1.75m, slim. Blonde hair, blue eyes, long hair. Luxury: tailored suit, designer bag. Aristocratic fine face.",
  },
  {
    id: "chloe-b",
    name: "Chloé B",
    aliases: ["chloe b"],
    gender: "female",
    category: "fr_beauty",
    nationality: "fr",
    visual_description:
      "French skincare and beauty creator. Female, ~1.62m, slim. Brown hair, brown eyes, mid-length hair. Natural minimal-makeup, soft sweaters. Young face, flawless skin.",
  },
  {
    id: "clara-marz",
    name: "Clara Marz",
    aliases: ["claramarz"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French lifestyle, music and vlog creator. Female, ~1.67m, slim. Brown wavy hair, hazel eyes. Artistic: vintage jewelry, colorful jackets. Expressive face.",
  },
  {
    id: "nabilla",
    name: "Nabilla",
    aliases: ["nabilla benattia"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French glamour and reality-TV celebrity. Female, ~1.70m, slim. Brown hair, brown eyes, long straight hair. Ultra-glamorous with surgically-enhanced lips. Crop top, stiletto heels.",
  },
  {
    id: "iris-mittenaere",
    name: "Iris Mittenaere",
    aliases: ["iris", "miss france", "miss univers 2016"],
    gender: "female",
    category: "fr_model",
    nationality: "fr",
    visual_description:
      "French Miss France and Miss Universe 2016. Female, ~1.63m, slim. Brown hair, brown eyes, mid-length. Elegant: evening dress, suit. Symmetrical face, perfect smile.",
  },
  {
    id: "camille-lv",
    name: "Camille LV",
    aliases: ["camille leblanc"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French fashion and luxury influencer. Female, ~1.72m, slim. Blonde hair, blue eyes. Bourgeois-chic: trench coat, sunglasses. Fine face.",
  },
  {
    id: "juste-zoe",
    name: "Juste Zoé",
    aliases: ["juste zoe"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French lifestyle and travel creator. Female, ~1.65m, normal build. Brown hair, brown eyes. Bohemian: long dresses, hat. Soft face.",
  },
  {
    id: "the-doll-beauty",
    name: "The Doll Beauty",
    aliases: ["doll beauty", "thedollbeauty"],
    gender: "female",
    category: "fr_beauty",
    nationality: "fr",
    visual_description:
      "French beauty and makeup creator. Female, ~1.60m, slim. Brown hair, brown eyes. Glamorous: false lashes, heavy contouring. Doll-like face.",
  },
  {
    id: "danae-makeup",
    name: "Danae Makeup",
    aliases: ["danae", "danaemakeup"],
    gender: "female",
    category: "fr_beauty",
    nationality: "fr",
    visual_description:
      "French professional makeup artist. Female, ~1.62m, slim. Brown hair, hazel eyes. Creative: colorful makeup, black clothing.",
  },
  {
    id: "marion-cameleon",
    name: "Marion Caméléon",
    aliases: ["marion cameleon", "marioncameleon"],
    gender: "female",
    category: "fr_beauty",
    nationality: "fr",
    visual_description:
      "French fashion and costume creator. Female, ~1.68m, normal build. Brown hair, brown eyes. Chameleon identity: constantly changes hairstyle and look. Neutral base face.",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // FITNESS / SPORT (FRANCE)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "tibo-inshape",
    name: "Tibo InShape",
    aliases: ["tibo", "thibault inshape"],
    gender: "male",
    category: "fr_fitness",
    nationality: "fr",
    visual_description:
      "French bodybuilding YouTuber. Male, ~1.85m, extremely muscular bodybuilder physique. Bald head, brown eyes, tanned skin. Defined pectorals, visible veins. Tank top, shorts. Often shirtless.",
  },
  {
    id: "juju-fitcats",
    name: "Juju Fitcats",
    aliases: ["juju fitcats", "justine quintin"],
    gender: "female",
    category: "fr_fitness",
    nationality: "fr",
    visual_description:
      "French fitness and nutrition creator. Female, ~1.65m, athletic with visible abs. Blonde hair, blue eyes, long hair usually tied up. Sportswear: leggings, sports bra. Pretty determined face.",
  },
  {
    id: "sissy-mua",
    name: "Sissy MUA",
    aliases: ["sissy", "sissymua"],
    gender: "female",
    category: "fr_fitness",
    nationality: "fr",
    visual_description:
      "French fitness program creator. Female, ~1.68m, athletic with well-developed glutes. Brown hair, brown eyes, long hair. Fitted sportswear. Made-up face.",
  },
  {
    id: "nassim-sahili",
    name: "Nassim Sahili",
    aliases: ["nassim"],
    gender: "male",
    category: "fr_fitness",
    nationality: "fr",
    visual_description:
      "French bodybuilding coach. Male, ~1.78m, very muscular. Brown hair, brown eyes, beard. Street-fitness: tracksuit, cap. Visible tattoos.",
  },
  {
    id: "enzo-foukra",
    name: "Enzo Foukra",
    aliases: ["enzo foukra", "enzo"],
    gender: "male",
    category: "fr_fitness",
    nationality: "fr",
    visual_description:
      "French fitness and motivation creator. Male, ~1.80m, lean muscular. Brown hair, brown eyes. Street: baggy, tank top. Angular face.",
  },
  {
    id: "yanisport",
    name: "Yanisport",
    aliases: ["yanis sport", "yanis"],
    gender: "male",
    category: "fr_fitness",
    nationality: "fr",
    visual_description:
      "French sports coach YouTuber. Male, ~1.75m, athletic. Brown hair, brown eyes. Clean: white t-shirt, shorts. Friendly face.",
  },
  {
    id: "bodytime",
    name: "Bodytime",
    aliases: ["body time"],
    gender: "duo",
    category: "fr_fitness",
    nationality: "fr",
    visual_description:
      "French fitness duo. Two muscular men, shaved or bearded, ~1.80m each. Classic fitness look: gloves, belt.",
  },
  {
    id: "alex-levand",
    name: "Alex Levand",
    aliases: ["alexlevand"],
    gender: "male",
    category: "fr_fitness",
    nationality: "fr",
    visual_description:
      "French fitness and lifestyle creator. Male, ~1.83m, lean muscular. Brown hair, brown eyes. Fit-influencer: fitted sweatshirt, smartwatch.",
  },
  {
    id: "jean-onche",
    name: "Jean Onche",
    aliases: ["jeanonche"],
    gender: "male",
    category: "fr_comedy",
    nationality: "fr",
    visual_description:
      "French humor and bodybuilding creator. Male, ~1.75m, massive heavy build. Bearded, bald or very short hair. Quirky: humor t-shirt, jogging.",
  },
  {
    id: "thibault-geoffray",
    name: "Thibault Geoffray",
    aliases: ["thibault geoffray"],
    gender: "male",
    category: "fr_fitness",
    nationality: "fr",
    visual_description:
      "French nutrition and fitness creator. Male, ~1.78m, naturally athletic. Brown hair, brown eyes. Healthy: fleece, sneakers. Young face.",
  },
  {
    id: "justine-gallice",
    name: "Justine Gallice",
    aliases: ["justine gallice"],
    gender: "female",
    category: "fr_fitness",
    nationality: "fr",
    visual_description:
      "French fitness and lifestyle creator. Female, ~1.67m, athletic. Blonde hair, blue eyes, long hair. Sports: neon leggings.",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // GAMING / STREAMING (FRANCE)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "gotaga",
    name: "Gotaga",
    aliases: ["corentin houssein"],
    gender: "male",
    category: "fr_gaming",
    nationality: "fr",
    visual_description:
      "French streamer and ex-professional FPS player. Male, ~1.78m, normal build. Mixed race, short black hair, brown eyes. Street: cap, sweatshirt. Light beard.",
  },
  {
    id: "domingo",
    name: "Domingo",
    aliases: ["quentin domingo"],
    gender: "male",
    category: "fr_gaming",
    nationality: "fr",
    visual_description:
      "French gaming host and streamer. Male, ~1.75m, average build. Brown hair, brown eyes, glasses. Casual: shirt, jeans. Smiling friendly face.",
  },
  {
    id: "kameto",
    name: "Kameto",
    aliases: ["kévin diagne", "kevin diagne"],
    gender: "male",
    category: "fr_gaming",
    nationality: "fr",
    visual_description:
      "French streamer and KCorp CEO. Male, ~1.80m, stocky but muscular. Dark black hair, heavy beard, brown eyes. KCorp branded tracksuit. Broad strong face.",
  },
  {
    id: "zerator",
    name: "Zerator",
    aliases: ["antoine bournier"],
    gender: "male",
    category: "fr_gaming",
    nationality: "fr",
    visual_description:
      "French gaming event organizer and streamer. Male, ~1.78m, normal build. Brown hair, beard, brown eyes. Simple: t-shirt, cap. Thick prominent eyebrows.",
  },
  {
    id: "ponce",
    name: "Ponce",
    aliases: ["anthony hazael-massieux", "anthoponce"],
    gender: "male",
    category: "fr_gaming",
    nationality: "fr",
    visual_description:
      "French chill streamer. Male, ~1.72m, slim. Brown hair, mustache, brown eyes. Relaxed: wide loose sweater.",
  },
  {
    id: "maghla",
    name: "Maghla",
    aliases: ["margaux streamer"],
    gender: "female",
    category: "fr_gaming",
    nationality: "fr",
    visual_description:
      "French gaming streamer. Female, ~1.65m, slim. Brown hair, brown eyes, long hair. Subtle gothic: black clothing, silver jewelry. Pale complexion.",
  },
  {
    id: "ultia",
    name: "Ultia",
    aliases: ["mathilde galoyer"],
    gender: "female",
    category: "fr_gaming",
    nationality: "fr",
    visual_description:
      "French gaming streamer. Female, ~1.62m, slim. Blonde hair, blue eyes, long hair. Pastel kawaii: pink and unicorn aesthetic. Doll-like face.",
  },
  {
    id: "chowh1",
    name: "Chowh1",
    aliases: ["chow"],
    gender: "male",
    category: "fr_gaming",
    nationality: "fr",
    visual_description:
      "French FPS streamer. Male, ~1.80m, sporty build. Brown hair, brown eyes. Street: cap, jogging.",
  },
  {
    id: "mistermv",
    name: "MisterMV",
    aliases: ["martin victor", "mister mv"],
    gender: "male",
    category: "fr_gaming",
    nationality: "fr",
    visual_description:
      "French variety streamer. Male, ~1.75m, normal build. Bearded, glasses. Geek: retro gaming t-shirt.",
  },
  {
    id: "etoiles",
    name: "Etoiles",
    aliases: ["alexandre danois", "étoiles"],
    gender: "male",
    category: "fr_gaming",
    nationality: "fr",
    visual_description:
      "French variety streamer. Male, ~1.78m, young build. Brown hair, brown eyes. Simple: sweatshirt, jeans. Fine face.",
  },
  {
    id: "locklear",
    name: "Locklear",
    aliases: ["locklear streamer"],
    gender: "male",
    category: "fr_gaming",
    nationality: "fr",
    visual_description:
      "French streamer. Male, ~1.80m, normal build. Brown hair, brown eyes. Casual everyday.",
  },
  {
    id: "jl-tomy",
    name: "JL Tomy",
    aliases: ["tomy jl", "jl crew tomy"],
    gender: "male",
    category: "fr_gaming",
    nationality: "fr",
    visual_description:
      "French streamer (JL family). Male, ~1.70m, slim. Brown hair, glasses. Relaxed casual.",
  },
  {
    id: "jl-amine",
    name: "JL Amine",
    aliases: ["amine jl", "jl crew amine"],
    gender: "male",
    category: "fr_gaming",
    nationality: "fr",
    visual_description:
      "French streamer (JL family). Male, ~1.75m, normal build. Brown hair, brown eyes.",
  },
  {
    id: "jl-bichou",
    name: "JL Bichou",
    aliases: ["bichou jl", "jl crew bichou"],
    gender: "male",
    category: "fr_gaming",
    nationality: "fr",
    visual_description:
      "French streamer (JL family). Male, ~1.72m, slightly stocky. Brown hair.",
  },
  {
    id: "terracid",
    name: "Terracid",
    aliases: ["terracid wankil", "wankil studio terracid"],
    gender: "male",
    category: "fr_gaming",
    nationality: "fr",
    visual_description:
      "French humor streamer (Wankil Studio duo). Male, ~1.78m, normal build. Brown hair, brown eyes. Simple casual.",
  },
  {
    id: "laink",
    name: "Laink",
    aliases: ["laink wankil", "wankil studio laink"],
    gender: "male",
    category: "fr_gaming",
    nationality: "fr",
    visual_description:
      "French humor streamer (Wankil Studio duo). Male, ~1.80m, slim. Brown hair, brown eyes. Simple casual.",
  },
  {
    id: "vodk",
    name: "VodK",
    aliases: ["vodk streamer"],
    gender: "male",
    category: "fr_gaming",
    nationality: "fr",
    visual_description:
      "French streamer. Male, ~1.77m, normal. Brown hair, brown eyes. Casual gaming.",
  },
  {
    id: "sora",
    name: "Sora",
    aliases: ["sora streamer", "sora fr"],
    gender: "male",
    category: "fr_gaming",
    nationality: "fr",
    visual_description:
      "French streamer. Male, mid-20s. Dark hair. Casual gaming style.",
  },
  {
    id: "ad-laurent",
    name: "AD Laurent",
    aliases: ["ad laurent", "adlaurent"],
    gender: "male",
    category: "fr_gaming",
    nationality: "fr",
    visual_description:
      "French streamer and content creator. Male, ~1.85m, muscular, numerous tattoos on arms and chest. Brown eyes, beard. Bad-boy: gold chain, leather jacket.",
  },
  {
    id: "gatooz",
    name: "Gatooz",
    aliases: ["gatoo z"],
    gender: "male",
    category: "fr_gaming",
    nationality: "fr",
    visual_description:
      "French streamer. Male, ~1.82m, muscular, full beard, brown eyes. Virile. Street: sweatshirt, jogging.",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ÉDUCATION / VULGARISATION (FRANCE)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "hugodecrypte",
    name: "HugoDécrypte",
    aliases: ["hugo decrypte", "hugo décrypte", "hugo travers"],
    gender: "male",
    category: "fr_education",
    nationality: "fr",
    visual_description:
      "French journalist and news YouTuber. Male, ~1.80m, slim. Brown hair, brown eyes, neatly styled. Casual-chic: shirt, jeans. Serious composed face.",
  },
  {
    id: "nota-bene",
    name: "Nota Bene",
    aliases: ["notabene", "benjamin brillaud"],
    gender: "male",
    category: "fr_education",
    nationality: "fr",
    visual_description:
      "French history YouTuber. Male, ~1.75m, normal build. Brown hair, brown eyes, beard. Intellectual: roll-neck sweater, sometimes glasses.",
  },
  {
    id: "dr-nozman",
    name: "Dr Nozman",
    aliases: ["nozman", "nicolas beudin"],
    gender: "male",
    category: "fr_education",
    nationality: "fr",
    visual_description:
      "French science YouTuber. Male, ~1.78m, normal. Brown hair, brown eyes, beard. Relaxed geek: science t-shirt.",
  },
  {
    id: "dirty-biology",
    name: "DirtyBiology",
    aliases: ["dirty biology", "léo bernard", "leo bernard"],
    gender: "male",
    category: "fr_education",
    nationality: "fr",
    visual_description:
      "French biology YouTuber with humor. Male, ~1.80m, slim, long hair. Brown hair, brown eyes. Hipster: full beard, flannel check shirt.",
  },
  {
    id: "cyrus-north",
    name: "Cyrus North",
    aliases: ["cyrusnorth"],
    gender: "male",
    category: "fr_education",
    nationality: "fr",
    visual_description:
      "French philosophy YouTuber. Male, ~1.75m, normal. Brown hair, brown eyes, beard. Simple casual.",
  },
  {
    id: "gaspard-g",
    name: "Gaspard G",
    aliases: ["gaspard"],
    gender: "male",
    category: "fr_education",
    nationality: "fr",
    visual_description:
      "French politics and economics YouTuber. Male, ~1.82m, slim. Brown hair, brown eyes. BCBG: tailored suit or blazer.",
  },
  {
    id: "science-etonnante",
    name: "ScienceEtonnante",
    aliases: ["science etonnante", "david louapre"],
    gender: "male",
    category: "fr_education",
    nationality: "fr",
    visual_description:
      "French physics YouTuber. Male, ~1.70m, normal. Brown hair, brown eyes, glasses. Professor look.",
  },
  {
    id: "monsieur-phi",
    name: "Monsieur Phi",
    aliases: ["monsieurphi"],
    gender: "male",
    category: "fr_education",
    nationality: "fr",
    visual_description:
      "French philosophy YouTuber. Male, ~1.78m, normal. Brown hair, brown eyes, beard. University intellectual.",
  },
  {
    id: "linguisticae",
    name: "Linguisticae",
    aliases: ["rémi fonteneau", "remi fonteneau"],
    gender: "male",
    category: "fr_education",
    nationality: "fr",
    visual_description:
      "French linguistics YouTuber. Male, ~1.75m, normal. Brown hair, brown eyes. Casual.",
  },
  {
    id: "charles-villa",
    name: "Charles Villa",
    aliases: ["charlesvilla"],
    gender: "male",
    category: "fr_education",
    nationality: "fr",
    visual_description:
      "French geography and history YouTuber. Male, ~1.80m, slim. Brown hair, brown eyes. Modern casual.",
  },
  {
    id: "doc-seven",
    name: "Doc Seven",
    aliases: ["doc 7"],
    gender: "male",
    category: "fr_education",
    nationality: "fr",
    visual_description:
      "French medical content creator. Male, ~1.75m. Casual semi-professional.",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // +18 / GLAMOUR (FRANCE) — SFW OUTPUT ONLY
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "mymi-rose",
    name: "Mymi Rose",
    aliases: ["mymi"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French content creator (SFW). Female, ~1.62m, generous curvy figure (large chest, wide hips). Brown hair, brown eyes, long hair. Glamorous. (SFW output only.)",
  },
  {
    id: "eva-elfie-fr",
    name: "Eva Elfie FR",
    aliases: ["eva elfie france"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French content creator (SFW). Female, ~1.63m, slim. Blonde hair, blue eyes, long hair. Girl-next-door: light dress. Juvenile face. (SFW output only.)",
  },
  {
    id: "lila-taleb",
    name: "Lila Taleb",
    aliases: ["lila taleb"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French content creator (SFW). Female, ~1.65m, athletic. Brown hair, brown eyes. (SFW output only.)",
  },
  {
    id: "cassandra-calogera",
    name: "Cassandra Calogera",
    aliases: ["cassandra"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French content creator (SFW). Female, ~1.68m, curvy. Brown hair, hazel eyes. Glamorous. (SFW output only.)",
  },
  {
    id: "lea-mary",
    name: "Léa Mary",
    aliases: ["lea mary", "léa"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French content creator (SFW). Female, ~1.67m, slim. Blonde hair, blue eyes. Natural. (SFW output only.)",
  },
  {
    id: "astrid-nelsia",
    name: "Astrid Nelsia",
    aliases: ["astrid"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French content creator (SFW). Female, ~1.70m, athletic. Mixed race, curly natural hair. Exotic style. (SFW output only.)",
  },
  {
    id: "marine-el-himer",
    name: "Marine El Himer",
    aliases: ["marine elhimer"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French content creator (SFW). Female, ~1.65m, slim. Brown hair, brown eyes. Glamorous. (SFW output only.)",
  },
  {
    id: "oceane-el-himer",
    name: "Océane El Himer",
    aliases: ["oceane el himer"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French content creator (SFW). Female, ~1.64m, slim. Brown hair, brown eyes. Near-identical twin of Marine El Himer. (SFW output only.)",
  },
  {
    id: "melanie-orl",
    name: "Mélanie Orl",
    aliases: ["melanie orl"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French content creator (SFW). Female, ~1.68m, curvy. Brown hair, green eyes. (SFW output only.)",
  },
  {
    id: "maeva-ghennam",
    name: "Maeva Ghennam",
    aliases: ["maeva"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French glamour influencer. Female, ~1.70m, generous curves (notable chest and hips). Brown hair, brown eyes. Very glamorous: crop top, leggings. (SFW output only.)",
  },
  {
    id: "sarah-fraisou",
    name: "Sarah Fraisou",
    aliases: ["sarah fraisou"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French content creator (SFW). Female, ~1.65m, full-figured. Brown hair, brown eyes. Body-positive. (SFW output only.)",
  },
  {
    id: "laura-lempika",
    name: "Laura Lempika",
    aliases: ["laura lempika"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French content creator (SFW). Female, ~1.72m, slim. Brown hair, brown eyes. Glamorous. (SFW output only.)",
  },
  {
    id: "manon-tanti",
    name: "Manon Tanti",
    aliases: ["manon tanti"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French content creator (SFW). Female, ~1.63m, normal build. Brown hair, brown eyes. (SFW output only.)",
  },
  {
    id: "carla-moreau",
    name: "Carla Moreau",
    aliases: ["carla moreau"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French content creator (SFW). Female, ~1.60m, short and slim. Brown hair, brown eyes. (SFW output only.)",
  },
  {
    id: "shanna-kress",
    name: "Shanna Kress",
    aliases: ["shanna"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French content creator (SFW). Female, ~1.70m, athletic. Brown hair, green eyes. (SFW output only.)",
  },
  {
    id: "kim-glow",
    name: "Kim Glow",
    aliases: ["kimglow"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French content creator (SFW). Female, ~1.68m, slim. Blonde hair, blue eyes. Glowing glittery makeup style. (SFW output only.)",
  },
  {
    id: "gaelle-garcia-diaz",
    name: "Gaëlle Garcia Diaz",
    aliases: ["gaelle garcia diaz", "gaelle garcia"],
    gender: "female",
    category: "fr_lifestyle",
    nationality: "fr",
    visual_description:
      "French glamour influencer. Female, ~1.72m, sculpted body (abs, prominent glutes). Long brown hair. Luxury look. (SFW output only.)",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // INTERNATIONAL ADULT CONTENT — SFW OUTPUT ONLY
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "amouranth",
    name: "Amouranth",
    aliases: ["kaitlyn siragusa"],
    gender: "female",
    category: "int_adult",
    nationality: "us",
    visual_description:
      "American streamer and content creator (SFW only). Female, ~1.65m, very generous curves. Signature long red/auburn hair, green eyes. Kawaii or glamour style. (SFW output only.)",
  },
  {
    id: "belle-delphine",
    name: "Belle Delphine",
    aliases: ["belle delphine"],
    gender: "female",
    category: "int_adult",
    nationality: "uk",
    visual_description:
      "British content creator (SFW only). Female, ~1.62m, slim. Signature pink hair, blue eyes. Kawaii: fairy ears, heavy doll-like makeup. (SFW output only.)",
  },
  {
    id: "corinna-kopf",
    name: "Corinna Kopf",
    aliases: ["corinna kopf", "corinna"],
    gender: "female",
    category: "int_adult",
    nationality: "us",
    visual_description:
      "American content creator (SFW). Female, ~1.70m, slim slender. Blonde hair, blue eyes. Californian casual. (SFW output only.)",
  },
  {
    id: "jem-wolfie",
    name: "Jem Wolfie",
    aliases: ["jem wolfie"],
    gender: "female",
    category: "int_adult",
    nationality: "au",
    visual_description:
      "Australian fitness content creator (SFW). Female, ~1.68m, athletic with prominent glutes. Brown hair, brown eyes. Sportswear. (SFW output only.)",
  },
  {
    id: "violet-myers",
    name: "Violet Myers",
    aliases: ["violet myers"],
    gender: "female",
    category: "int_adult",
    nationality: "us",
    visual_description:
      "American content creator (SFW). Female, ~1.60m, generous curves. Brown hair, brown eyes. Latina style. (SFW output only.)",
  },
  {
    id: "emily-black",
    name: "Emily Black",
    aliases: ["emily black"],
    gender: "female",
    category: "int_adult",
    nationality: "uk",
    visual_description:
      "British content creator (SFW). Female, ~1.65m, slim. Brown hair, brown eyes. Girl-next-door. (SFW output only.)",
  },
  {
    id: "lauren-alexis",
    name: "Lauren Alexis",
    aliases: ["lauren alexis"],
    gender: "female",
    category: "int_adult",
    nationality: "uk",
    visual_description:
      "British content creator (SFW). Female, ~1.67m, slim. Brown hair, brown eyes. British glam. (SFW output only.)",
  },
  {
    id: "lena-the-plug",
    name: "Lena The Plug",
    aliases: ["lena plug", "lena the plug"],
    gender: "female",
    category: "int_adult",
    nationality: "us",
    visual_description:
      "American content creator (SFW). Female, ~1.70m, athletic, tattoos. Brown hair, brown eyes. Spicy fitness look. (SFW output only.)",
  },
  {
    id: "sky-bri",
    name: "Sky Bri",
    aliases: ["sky bri", "skybri"],
    gender: "female",
    category: "int_adult",
    nationality: "us",
    visual_description:
      "American content creator (SFW). Female, ~1.73m, slim. Blonde hair, blue eyes, long hair. Californian beach style. (SFW output only.)",
  },
  {
    id: "karina-pedro",
    name: "Karina Pedro",
    aliases: ["karina pedro"],
    gender: "female",
    category: "int_adult",
    nationality: "us",
    visual_description:
      "American content creator (SFW). Female, ~1.62m, generous curves. Brown hair, brown eyes. Latina style. (SFW output only.)",
  },
  {
    id: "ana-cheri",
    name: "Ana Cheri",
    aliases: ["ana cheri"],
    gender: "female",
    category: "int_adult",
    nationality: "us",
    visual_description:
      "American fitness model and content creator (SFW). Female, ~1.68m, very athletic (abs, glutes). Brown hair, green eyes. Sport-chic. (SFW output only.)",
  },
  {
    id: "sommer-ray",
    name: "Sommer Ray",
    aliases: ["sommer ray", "sommer"],
    gender: "female",
    category: "int_adult",
    nationality: "us",
    visual_description:
      "American glamour fitness influencer (SFW). Female, ~1.73m, athletic, celebrated glutes. Brown hair, brown eyes. Fitness lifestyle. (SFW output only.)",
  },
  {
    id: "abby-rao",
    name: "Abby Rao",
    aliases: ["abby rao"],
    gender: "female",
    category: "int_adult",
    nationality: "us",
    visual_description:
      "American content creator (SFW). Female, ~1.65m, slim, tattoos. Brown hair, brown eyes. Alternative look. (SFW output only.)",
  },
  {
    id: "katie-sigmond",
    name: "Katie Sigmond",
    aliases: ["katie sigmond"],
    gender: "female",
    category: "int_adult",
    nationality: "us",
    visual_description:
      "American content creator (SFW). Female, ~1.68m, athletic. Brown hair, brown eyes. Glamorous golfer aesthetic. (SFW output only.)",
  },
  {
    id: "hannah-owo",
    name: "Hannah Owo",
    aliases: ["hannah owo"],
    gender: "female",
    category: "int_adult",
    nationality: "us",
    visual_description:
      "American content creator (SFW). Female, ~1.62m, slim. Brown hair, brown eyes. E-girl style. (SFW output only.)",
  },
  {
    id: "sarati",
    name: "Sarati",
    aliases: ["sarati"],
    gender: "female",
    category: "int_adult",
    nationality: "us",
    visual_description:
      "American content creator (SFW). Female, ~1.67m, normal. Brown hair, brown eyes. (SFW output only.)",
  },
  {
    id: "kinsey-wolanski",
    name: "Kinsey Wolanski",
    aliases: ["kinsey wolanski"],
    gender: "female",
    category: "int_adult",
    nationality: "us",
    visual_description:
      "American model and content creator (SFW). Female, ~1.70m, slim. Blonde hair, blue eyes. Model look. (SFW output only.)",
  },
  {
    id: "jack-doherty",
    name: "Jack Doherty",
    aliases: ["jack doherty"],
    gender: "male",
    category: "int_adult",
    nationality: "us",
    visual_description:
      "American YouTuber. Male, ~1.75m, slim, young. Brown hair, brown eyes. Casual American.",
  },
  {
    id: "jason-luv",
    name: "Jason Luv",
    aliases: ["jason luv"],
    gender: "male",
    category: "int_adult",
    nationality: "us",
    visual_description:
      "American content creator (SFW). Male, ~1.88m, very muscular, numerous tattoos. Beard. Bodybuilder street. (SFW output only.)",
  },
  {
    id: "bryce-hall",
    name: "Bryce Hall",
    aliases: ["bryce hall"],
    gender: "male",
    category: "int_adult",
    nationality: "us",
    visual_description:
      "American TikToker (SFW). Male, ~1.83m, slim, tattoos. Brown hair, brown eyes. TikTok influencer. (SFW output only.)",
  },
  {
    id: "harry-jowsey",
    name: "Harry Jowsey",
    aliases: ["harry jowsey"],
    gender: "male",
    category: "int_adult",
    nationality: "au",
    visual_description:
      "Australian Too Hot To Handle star (SFW). Male, ~1.90m, muscular. Brown hair, brown eyes, tattoos. Playboy Australian look. (SFW output only.)",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // INTERNATIONAUX — YOUTUBE / TIKTOK
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "mrbeast",
    name: "MrBeast",
    aliases: ["mr beast", "jimmy donaldson"],
    gender: "male",
    category: "int_youtube",
    nationality: "us",
    visual_description:
      "American philanthropist YouTuber (Jimmy Donaldson). Male, ~1.88m, tall slim. Medium-long brown hair, brown eyes, angular face. Wide forced smile. Casual: t-shirt, jeans.",
  },
  {
    id: "pewdiepie",
    name: "PewDiePie",
    aliases: ["pewdiepie", "felix kjellberg"],
    gender: "male",
    category: "int_youtube",
    nationality: "se",
    visual_description:
      "Swedish gaming and humor YouTuber (Felix Kjellberg). Male, ~1.80m, slim. Brown hair, blue eyes, several-day beard. Casual Scandinavian: sweatshirt, jogging.",
  },
  {
    id: "charli-damelio",
    name: "Charli D'Amelio",
    aliases: ["charli damelio", "charli"],
    gender: "female",
    category: "int_tiktok",
    nationality: "us",
    visual_description:
      "American TikTok dance creator. Female, ~1.70m, slim. Brown hair, brown eyes, long hair. Teenage: leggings, crop top. Pretty neutral face.",
  },
  {
    id: "khaby-lame",
    name: "Khaby Lame",
    aliases: ["khaby lame", "khaby"],
    gender: "male",
    category: "int_tiktok",
    nationality: "it",
    visual_description:
      "Senegalese-Italian silent-humor TikTok creator. Male, ~1.85m, slim. Black, brown eyes, clean-shaved head. Simple iconic: white t-shirt, jeans. Very expressive deadpan face.",
  },
  {
    id: "addison-rae",
    name: "Addison Rae",
    aliases: ["addison rae", "addison"],
    gender: "female",
    category: "int_tiktok",
    nationality: "us",
    visual_description:
      "American TikTok dance and music creator. Female, ~1.68m, slim. Brown hair, brown eyes, long hair. American glamour: short dress, heels.",
  },
  {
    id: "logan-paul",
    name: "Logan Paul",
    aliases: ["logan paul", "logan"],
    gender: "male",
    category: "int_youtube",
    nationality: "us",
    visual_description:
      "American YouTuber and boxer. Male, ~1.83m, muscular with tattoos. Brown hair, brown eyes. Show-biz: flashy tracksuit, gold chain.",
  },
  {
    id: "jake-paul",
    name: "Jake Paul",
    aliases: ["jake paul", "jake"],
    gender: "male",
    category: "int_youtube",
    nationality: "us",
    visual_description:
      "American boxer and YouTuber. Male, ~1.85m, muscular with tattoos. Brown hair, brown eyes. Baggy streetwear.",
  },
  {
    id: "ksi",
    name: "KSI",
    aliases: ["jj olatunji", "jj"],
    gender: "male",
    category: "int_youtube",
    nationality: "uk",
    visual_description:
      "British-Nigerian YouTuber and rapper (JJ Olatunji). Male, ~1.83m, stocky but muscular. Black, brown eyes. Streetwear: bandana, oversize sweatshirt.",
  },
  {
    id: "emma-chamberlain",
    name: "Emma Chamberlain",
    aliases: ["emma chamberlain", "emma"],
    gender: "female",
    category: "int_youtube",
    nationality: "us",
    visual_description:
      "American vlogger. Female, ~1.68m, slim. Brown hair, brown eyes, mid-length. Vintage: wide trousers, small cropped tops. Stylishly tired face.",
  },
  {
    id: "bella-poarch",
    name: "Bella Poarch",
    aliases: ["bella poarch", "bella"],
    gender: "female",
    category: "int_tiktok",
    nationality: "us",
    visual_description:
      "Filipino-American TikTok creator. Female, ~1.60m, petite, tattoos. Filipino features, brown eyes. E-girl: colorful style, tights.",
  },
  {
    id: "zach-king",
    name: "Zach King",
    aliases: ["zach king"],
    gender: "male",
    category: "int_tiktok",
    nationality: "us",
    visual_description:
      "American digital illusionist and TikToker. Male, ~1.75m, normal. Brown hair, brown eyes. Casual: shirt, jeans.",
  },
  {
    id: "brent-rivera",
    name: "Brent Rivera",
    aliases: ["brent rivera"],
    gender: "male",
    category: "int_tiktok",
    nationality: "us",
    visual_description:
      "American vlogger and TikToker. Male, ~1.80m, muscular, light beard. Brown hair, brown eyes. Californian: white t-shirt.",
  },
  {
    id: "lele-pons",
    name: "Lele Pons",
    aliases: ["lele pons"],
    gender: "female",
    category: "int_tiktok",
    nationality: "us",
    visual_description:
      "Venezuelan-American creator. Female, ~1.68m, slim, tattoos. Brown hair, brown eyes. Latina glam.",
  },
  {
    id: "markiplier",
    name: "Markiplier",
    aliases: ["mark fischbach"],
    gender: "male",
    category: "int_youtube",
    nationality: "us",
    visual_description:
      "American gaming YouTuber (Mark Fischbach). Male, ~1.78m, normal. Brown hair, brown eyes, beard. Casual hooded sweatshirt.",
  },
  {
    id: "ninja",
    name: "Ninja",
    aliases: ["tyler blevins"],
    gender: "male",
    category: "int_gaming",
    nationality: "us",
    visual_description:
      "American Fortnite streamer (Tyler Blevins). Male, ~1.80m, slim. Blonde hair often dyed vibrant colors (signature blue), blue eyes. Street casual.",
  },
  {
    id: "pokimane",
    name: "Pokimane",
    aliases: ["imane anys", "poki"],
    gender: "female",
    category: "int_gaming",
    nationality: "ca",
    visual_description:
      "Moroccan-Canadian streamer (Imane Anys). Female, ~1.62m, slim. Brown long hair, brown eyes, North African features. Cute casual: pink sweater.",
  },
  {
    id: "kai-cenat",
    name: "Kai Cenat",
    aliases: ["kai cenat"],
    gender: "male",
    category: "int_gaming",
    nationality: "us",
    visual_description:
      "American streamer. Male, ~1.78m, normal. Black, brown eyes, shaved head. Streetwear: big sneakers, cap. Very energetic expressive face.",
  },
  {
    id: "ishowspeed",
    name: "IShowSpeed",
    aliases: ["speed", "darren watkins"],
    gender: "male",
    category: "int_gaming",
    nationality: "us",
    visual_description:
      "American gaming streamer (Darren Watkins Jr.). Male, ~1.78m, slim. Black, brown eyes, braided hair. Flashy tracksuit. Extremely energetic.",
  },
  {
    id: "dream",
    name: "Dream",
    aliases: ["clay dream", "dreamwastaken"],
    gender: "male",
    category: "int_gaming",
    nationality: "us",
    visual_description:
      "American gaming YouTuber. Male, ~1.87m, tall slim. Light brown hair, light skin. Signature white smiley-face mask in older content; now shows face openly.",
  },
  {
    id: "mkbhd",
    name: "MKBHD",
    aliases: ["marques brownlee", "marques"],
    gender: "male",
    category: "int_youtube",
    nationality: "us",
    visual_description:
      "American tech YouTuber Marques Brownlee. Male, ~1.85m, slim. Black, brown eyes, clean-shaved. Smart-casual: polo shirt, quality sneakers.",
  },
  {
    id: "casey-neistat",
    name: "Casey Neistat",
    aliases: ["casey neistat"],
    gender: "male",
    category: "int_youtube",
    nationality: "us",
    visual_description:
      "American filmmaker and vlogger. Male, ~1.78m, normal. Blonde hair, blue eyes, beard. New York: always wears sunglasses, motorcycle jacket.",
  },
  {
    id: "david-dobrik",
    name: "David Dobrik",
    aliases: ["david dobrik"],
    gender: "male",
    category: "int_youtube",
    nationality: "us",
    visual_description:
      "Slovak-American vlogger. Male, ~1.75m, slim. Brown hair, brown eyes. Young casual: sweatshirt, jeans.",
  },
  {
    id: "ryan-trahan",
    name: "Ryan Trahan",
    aliases: ["ryan trahan"],
    gender: "male",
    category: "int_youtube",
    nationality: "us",
    visual_description:
      "American challenge YouTuber. Male, ~1.78m, slim, young. Brown hair, brown eyes. Casual everyday.",
  },
  {
    id: "airrack",
    name: "Airrack",
    aliases: ["airrack"],
    gender: "male",
    category: "int_youtube",
    nationality: "us",
    visual_description:
      "American stunt YouTuber. Male, ~1.80m, normal. Brown hair, brown eyes. Casual American.",
  },
  {
    id: "dhar-mann",
    name: "Dhar Mann",
    aliases: ["dharr mann"],
    gender: "male",
    category: "int_youtube",
    nationality: "us",
    visual_description:
      "Indian-American moral video creator. Male, ~1.75m, normal. Brown hair, brown eyes, beard. Business-casual.",
  },
  {
    id: "dude-perfect",
    name: "Dude Perfect",
    aliases: ["dude perfect"],
    gender: "group",
    category: "int_youtube",
    nationality: "us",
    visual_description:
      "American trick-shot stunt team (5 members). Five tall athletic American men, sporty styles.",
  },
  {
    id: "sidemen",
    name: "Sidemen",
    aliases: ["sidemen group"],
    gender: "group",
    category: "int_youtube",
    nationality: "uk",
    visual_description:
      "British YouTube group of 7. Includes KSI (dark skin), various physiques. Young British men, streetwear UK style.",
  },
  {
    id: "veritasium",
    name: "Veritasium",
    aliases: ["derek muller"],
    gender: "male",
    category: "int_youtube",
    nationality: "ca",
    visual_description:
      "Australian-Canadian science YouTuber (Derek Muller). Male, ~1.83m, slim. Blonde hair, blue eyes. Simple casual.",
  },
  {
    id: "smarter-every-day",
    name: "SmarterEveryDay",
    aliases: ["smarter every day", "destin sandlin"],
    gender: "male",
    category: "int_youtube",
    nationality: "us",
    visual_description:
      "American science YouTuber (Destin Sandlin). Male, ~1.78m, normal. Brown hair, brown eyes, beard. Engineer look.",
  },
  {
    id: "linus-tech-tips",
    name: "Linus Tech Tips",
    aliases: ["linus", "ltt", "linus sebastian"],
    gender: "male",
    category: "int_youtube",
    nationality: "ca",
    visual_description:
      "Canadian tech YouTuber (Linus Sebastian). Male, ~1.78m, normal. Brown hair, brown eyes, beard. Geek casual.",
  },
  {
    id: "the-try-guys",
    name: "The Try Guys",
    aliases: ["try guys"],
    gender: "group",
    category: "int_youtube",
    nationality: "us",
    visual_description:
      "American YouTube test group (4 diverse men). Eugene Lee Yang (Korean-American), Keith Habersberger (tall), Zach Kornfeld (shorter), and former member Ned Fulmer. Diverse physiques.",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // INTERNATIONAUX — BEAUTÉ / MODE / ICÔNES
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "huda-kattan",
    name: "Huda Kattan",
    aliases: ["huda beauty", "huda kattan"],
    gender: "female",
    category: "int_beauty",
    nationality: "us",
    visual_description:
      "Iraqi-American beauty mogul. Female, ~1.65m, slim. Long brown hair, brown eyes. Luxury glamorous: blazer, heels. Middle Eastern features.",
  },
  {
    id: "kim-kardashian",
    name: "Kim Kardashian",
    aliases: ["kim k", "kim kardashian west"],
    gender: "female",
    category: "int_celebrity",
    nationality: "us",
    visual_description:
      "American media personality. Female, ~1.59m, iconic hourglass (strong hips, narrow waist). Brown hair, brown eyes. Hyper-glamorous luxury look.",
  },
  {
    id: "kylie-jenner",
    name: "Kylie Jenner",
    aliases: ["kylie jenner", "kylie"],
    gender: "female",
    category: "int_celebrity",
    nationality: "us",
    visual_description:
      "American beauty mogul. Female, ~1.68m, generous curves, surgically augmented full lips. Brown hair, brown eyes. Luxury streetwear.",
  },
  {
    id: "kendall-jenner",
    name: "Kendall Jenner",
    aliases: ["kendall jenner", "kendall"],
    gender: "female",
    category: "int_celebrity",
    nationality: "us",
    visual_description:
      "American supermodel. Female, ~1.79m, very slim and long. Brown hair, brown eyes. Top-model: runway or casual chic.",
  },
  {
    id: "hailey-bieber",
    name: "Hailey Bieber",
    aliases: ["hailey baldwin", "hailey bieber"],
    gender: "female",
    category: "int_celebrity",
    nationality: "us",
    visual_description:
      "American model. Female, ~1.71m, slim. Brown hair, brown eyes. Model streetwear style.",
  },
  {
    id: "selena-gomez",
    name: "Selena Gomez",
    aliases: ["selena gomez", "selena"],
    gender: "female",
    category: "int_celebrity",
    nationality: "us",
    visual_description:
      "American singer and actress. Female, ~1.65m, normal. Brown hair, brown eyes, round face. Elegant yet relaxed.",
  },
  {
    id: "beyonce",
    name: "Beyoncé",
    aliases: ["beyonce", "queen bey"],
    gender: "female",
    category: "int_celebrity",
    nationality: "us",
    visual_description:
      "American global superstar. Female, ~1.69m, athletic with strong curves. Black, brown eyes. Stage: sequins, power suits. Warm brown skin, often long blonde extensions.",
  },
  {
    id: "nikkie-tutorials",
    name: "NikkieTutorials",
    aliases: ["nikkie de jager", "nikkie tutorials"],
    gender: "female",
    category: "int_beauty",
    nationality: "nl",
    visual_description:
      "Dutch beauty YouTuber Nikkie de Jager. Female, ~1.88m, very tall, blonde hair, blue eyes, transgender woman. Always dramatically glam: sequins, heels, bold makeup.",
  },
  {
    id: "james-charles",
    name: "James Charles",
    aliases: ["james charles"],
    gender: "male",
    category: "int_beauty",
    nationality: "us",
    visual_description:
      "American beauty YouTuber. Male, ~1.70m, slim. Brown hair, brown eyes. Androgynous. Signature bold flashy artistic makeup.",
  },
  {
    id: "bretman-rock",
    name: "Bretman Rock",
    aliases: ["bretman rock"],
    gender: "male",
    category: "int_beauty",
    nationality: "us",
    visual_description:
      "Filipino-American beauty influencer. Male, ~1.70m, normal. Filipino features, brown eyes, tattoos. Eccentric extravagant look.",
  },
  {
    id: "chiara-ferragni",
    name: "Chiara Ferragni",
    aliases: ["chiara ferragni"],
    gender: "female",
    category: "int_beauty",
    nationality: "it",
    visual_description:
      "Italian fashion influencer. Female, ~1.77m, slim. Blonde hair, blue eyes. Italian luxury high-fashion.",
  },
  {
    id: "dixie-damelio",
    name: "Dixie D'Amelio",
    aliases: ["dixie damelio", "dixie"],
    gender: "female",
    category: "int_tiktok",
    nationality: "us",
    visual_description:
      "American TikToker and singer, sister of Charli. Female, ~1.68m, slim. Brown hair, brown eyes. Casual American.",
  },
  {
    id: "michelle-phan",
    name: "Michelle Phan",
    aliases: ["michelle phan"],
    gender: "female",
    category: "int_beauty",
    nationality: "us",
    visual_description:
      "Vietnamese-American beauty YouTuber. Female, ~1.57m, slim. Dark black hair, dark eyes. Light East Asian fair skin. Elegant beauty style.",
  },
  {
    id: "lilly-singh",
    name: "Lilly Singh",
    aliases: ["iisuperwomanii", "superwoman"],
    gender: "female",
    category: "int_youtube",
    nationality: "ca",
    visual_description:
      "Canadian-Indian YouTuber. Female, ~1.67m, athletic slim. Long dark hair, brown eyes. Warm brown skin (Punjabi-Indian). Bold colorful style.",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // INTERNATIONAUX — ATHLÈTES
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "cristiano-ronaldo",
    name: "Cristiano Ronaldo",
    aliases: ["ronaldo", "cr7"],
    gender: "male",
    category: "int_athlete",
    nationality: "pt",
    reference_image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cristiano_Ronaldo_2018.jpg/440px-Cristiano_Ronaldo_2018.jpg",
    visual_description:
      "Portuguese soccer superstar. Male, ~1.87m, extremely lean and muscular. Brown hair, brown eyes, chiseled sharp jaw. Sharp fade haircut. Sporty-chic or tailored suit. Very defined muscular body.",
  },
  {
    id: "lionel-messi",
    name: "Lionel Messi",
    aliases: ["messi", "leo messi"],
    gender: "male",
    category: "int_athlete",
    nationality: "ar",
    reference_image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Messi_vs_Nigeria_2018.jpg/440px-Messi_vs_Nigeria_2018.jpg",
    visual_description:
      "Argentine soccer legend. Male, ~1.70m, short and stocky. Brown hair and beard, brown eyes. Olive/medium skin. Simple: t-shirt, jeans. Very recognizable dark beard.",
  },
  {
    id: "neymar",
    name: "Neymar",
    aliases: ["neymar jr"],
    gender: "male",
    category: "int_athlete",
    nationality: "br",
    reference_image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Neymar_vs_Croatia_%28cropped%29.jpg/440px-Neymar_vs_Croatia_%28cropped%29.jpg",
    visual_description:
      "Brazilian soccer star Neymar Jr. Male, ~1.75m, slim with tattoos. Brown hair (often unique styles: mohawk, braids, bleached). Brown eyes. Fashion-forward: cap, jewelry.",
  },
  {
    id: "drake",
    name: "Drake",
    aliases: ["aubrey graham", "champagnepapi"],
    gender: "male",
    category: "int_celebrity",
    nationality: "ca",
    visual_description:
      "Canadian rapper Drake (Aubrey Graham). Male, ~1.82m, normal. Mixed race, brown eyes, beard. Luxury streetwear: Canada Goose, Nike. Fade haircut.",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // INTERNATIONAUX — GAMING / STREAMING
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "shroud",
    name: "Shroud",
    aliases: ["michael grzesiek"],
    gender: "male",
    category: "int_gaming",
    nationality: "ca",
    visual_description:
      "Polish-Canadian FPS streamer. Male, ~1.83m, normal. Brown hair, brown eyes, beard. Casual everyday.",
  },
  {
    id: "tfue",
    name: "Tfue",
    aliases: ["turner tenney"],
    gender: "male",
    category: "int_gaming",
    nationality: "us",
    visual_description:
      "American Fortnite streamer. Male, ~1.78m, slim, tattoos. Blonde hair, blue eyes. Street casual.",
  },
  {
    id: "timthetatman",
    name: "TimTheTatman",
    aliases: ["tim thetatman"],
    gender: "male",
    category: "int_gaming",
    nationality: "us",
    visual_description:
      "American streamer. Male, ~1.90m, large heavyset build, beard, glasses. Casual everyday.",
  },
  {
    id: "valkyrae",
    name: "Valkyrae",
    aliases: ["rachell hofstetter"],
    gender: "female",
    category: "int_gaming",
    nationality: "us",
    visual_description:
      "Filipino-American streamer. Female, ~1.63m, slim. Black hair, brown eyes. E-girl look.",
  },
  {
    id: "sykkuno",
    name: "Sykkuno",
    aliases: ["thomas lu"],
    gender: "male",
    category: "int_gaming",
    nationality: "us",
    visual_description:
      "Asian-American streamer. Male, ~1.70m, very slim. Black hair, brown eyes. Shy cute style.",
  },
  {
    id: "xqc",
    name: "xQc",
    aliases: ["felix lengyel", "xqcow"],
    gender: "male",
    category: "int_gaming",
    nationality: "ca",
    visual_description:
      "French-Canadian streamer. Male, ~1.88m, normal. Brown hair, brown eyes, beard. Very casual.",
  },
  {
    id: "dr-disrespect",
    name: "Dr Disrespect",
    aliases: ["dr disrespect"],
    gender: "male",
    category: "int_gaming",
    nationality: "us",
    visual_description:
      "American streamer persona. Male, ~1.96m, very tall. Signature: large black mullet wig, thick black mustache, dark wraparound sunglasses, camo or black tactical jacket. The champion persona.",
  },
  {
    id: "ludwig",
    name: "Ludwig",
    aliases: ["ludwig ahgren"],
    gender: "male",
    category: "int_gaming",
    nationality: "us",
    visual_description:
      "American streamer (Ludwig Ahgren). Male, ~1.85m, slim. Brown hair, brown eyes, beard. Casual cozy.",
  },
  {
    id: "asmongold",
    name: "Asmongold",
    aliases: ["zack asmongold"],
    gender: "male",
    category: "int_gaming",
    nationality: "us",
    visual_description:
      "American WoW streamer. Male, ~1.75m, normal. Brown hair (sometimes unkempt medium-length), brown eyes. Minimal geek casual.",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ACTEURS CINÉMA FRANÇAIS
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "jean-dujardin",
    name: "Jean Dujardin",
    aliases: ["jean dujardin"],
    gender: "male",
    category: "fr_actor",
    nationality: "fr",
    visual_description:
      "French Oscar-winning actor. Male, ~1.81m, athletic slim. Brown hair, brown eyes, warm smile. Charming old Hollywood look: suit, occasional mustache. Symmetrical face, dimples.",
  },
  {
    id: "jean-reno",
    name: "Jean Reno",
    aliases: ["jean reno"],
    gender: "male",
    category: "fr_actor",
    nationality: "fr",
    visual_description:
      "French-Spanish actor (The Professional). Male, ~1.87m, tall imposing build. Graying dark hair, brown eyes, square jaw. Serious face, strong brow. Often in dark coat or suit.",
  },
  {
    id: "omar-sy",
    name: "Omar Sy",
    aliases: ["omar sy"],
    gender: "male",
    category: "fr_actor",
    nationality: "fr",
    visual_description:
      "French actor (Intouchables, Lupin). Male, ~1.90m, very tall, athletic build. Black skin, brown eyes, bright wide smile. Shaved or very short hair. Charismatic elegant casual style.",
  },
  {
    id: "dany-boon",
    name: "Dany Boon",
    aliases: ["dany boon"],
    gender: "male",
    category: "fr_actor",
    nationality: "fr",
    visual_description:
      "French comedian and director (Bienvenue chez les Ch'tis). Male, ~1.80m, slim. Brown hair, blue eyes, wide grin. Ch'ti accent persona. Simple casual.",
  },
  {
    id: "kad-merad",
    name: "Kad Merad",
    aliases: ["kad merad"],
    gender: "male",
    category: "fr_actor",
    nationality: "fr",
    visual_description:
      "French comedian and actor. Male, ~1.78m, normal build. Brown hair, brown eyes, beard. Expressive round face. Casual-chic.",
  },
  {
    id: "guillaume-canet",
    name: "Guillaume Canet",
    aliases: ["guillaume canet"],
    gender: "male",
    category: "fr_actor",
    nationality: "fr",
    visual_description:
      "French actor and director. Male, ~1.79m, slim athletic. Brown hair, green eyes, stubble. Parisian chic: leather jacket, jeans. Intense look.",
  },
  {
    id: "gilles-lellouche",
    name: "Gilles Lellouche",
    aliases: ["gilles lellouche"],
    gender: "male",
    category: "fr_actor",
    nationality: "fr",
    visual_description:
      "French actor (Le Grand Bain). Male, ~1.75m, stocky build. Brown hair, brown eyes, three-day beard. Casual: jeans, t-shirt. Warm expressive face.",
  },
  {
    id: "francois-civil",
    name: "François Civil",
    aliases: ["francois civil", "françois civil"],
    gender: "male",
    category: "fr_actor",
    nationality: "fr",
    visual_description:
      "French actor (Le Bureau des Légendes). Male, ~1.77m, slim. Brown hair, brown eyes, beard. Smart-casual: jacket over t-shirt. Intense focused expression.",
  },
  {
    id: "jonathan-cohen",
    name: "Jonathan Cohen",
    aliases: ["jonathan cohen"],
    gender: "male",
    category: "fr_actor",
    nationality: "fr",
    visual_description:
      "French comedian and actor (Validé). Male, ~1.78m, normal build. Brown curly hair, brown eyes, beard. Young relaxed look: sweatshirt, cap. Warm smile.",
  },
  {
    id: "tarek-boudali",
    name: "Tarek Boudali",
    aliases: ["tarek boudali"],
    gender: "male",
    category: "fr_actor",
    nationality: "fr",
    visual_description:
      "French comedian and actor (Alibi.com). Male, ~1.78m, slim. Brown hair, brown eyes. Casual everyday look. Friendly expressive face.",
  },
  {
    id: "philippe-lacheau",
    name: "Philippe Lacheau",
    aliases: ["philippe lacheau"],
    gender: "male",
    category: "fr_actor",
    nationality: "fr",
    visual_description:
      "French director and actor (Babysitting). Male, ~1.79m, slim. Brown hair, brown eyes. Casual modern style. Mischievous smile.",
  },
  {
    id: "pierre-niney",
    name: "Pierre Niney",
    aliases: ["pierre niney"],
    gender: "male",
    category: "fr_actor",
    nationality: "fr",
    visual_description:
      "French César-winning actor (Yves Saint Laurent). Male, ~1.76m, slim elegant. Brown hair, light eyes, refined features. Classic chic: suit or blazer. Very fine delicate face.",
  },
  {
    id: "daniel-auteuil",
    name: "Daniel Auteuil",
    aliases: ["daniel auteuil"],
    gender: "male",
    category: "fr_actor",
    nationality: "fr",
    visual_description:
      "French iconic actor (Jean de Florette, Manon des Sources). Male, ~1.73m, normal build. White/graying hair, blue eyes. Thoughtful intellectual face. Smart-casual or suit.",
  },
  {
    id: "andre-dussollier",
    name: "André Dussollier",
    aliases: ["andre dussollier", "andré dussollier"],
    gender: "male",
    category: "fr_actor",
    nationality: "fr",
    visual_description:
      "French César-winning actor. Male, ~1.79m, slim. White hair, blue eyes, refined face. Intellectual elegant look: blazer.",
  },
  {
    id: "clovis-cornillac",
    name: "Clovis Cornillac",
    aliases: ["clovis cornillac"],
    gender: "male",
    category: "fr_actor",
    nationality: "fr",
    visual_description:
      "French actor and director. Male, ~1.75m, athletic build. Brown hair, brown eyes, beard. Rugged look: often in period costume or casual leather jacket.",
  },
  {
    id: "edouard-baer",
    name: "Edouard Baer",
    aliases: ["edouard baer", "édouard baer"],
    gender: "male",
    category: "fr_actor",
    nationality: "fr",
    visual_description:
      "French actor and humorist. Male, ~1.80m, slim lanky. Brown hair, blue eyes, often unshaven. Bohemian dandy look: long scarf, vintage coat.",
  },
  {
    id: "gerard-depardieu",
    name: "Gérard Depardieu",
    aliases: ["gerard depardieu", "gérard depardieu"],
    gender: "male",
    category: "fr_actor",
    nationality: "fr",
    visual_description:
      "French iconic actor. Male, ~1.79m, heavy large build. White hair, blue eyes, large nose. Imposing broad face. Casual or period costumes.",
  },
  {
    id: "alban-lennoir",
    name: "Alban Lenoir",
    aliases: ["alban lennoir", "alban lenoir"],
    gender: "male",
    category: "fr_actor",
    nationality: "fr",
    visual_description:
      "French actor (Balle Perdue). Male, ~1.80m, very muscular athletic build. Brown hair, brown eyes, beard. Tattoos on arms. Action-movie look: tank top, tactical clothes.",
  },
  {
    id: "patrick-bruel",
    name: "Patrick Bruel",
    aliases: ["patrick bruel"],
    gender: "male",
    category: "fr_actor",
    nationality: "fr",
    visual_description:
      "French singer and actor. Male, ~1.74m, slim. Brown hair, brown eyes, often stubble. Parisian casual-chic. Sensitive expressive face.",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ACTEURS CINÉMA HOLLYWOOD
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "brad-pitt",
    name: "Brad Pitt",
    aliases: ["brad pitt"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American A-list actor. Male, ~1.80m, lean athletic. Blonde hair, blue eyes, chiseled jaw. Timeless handsome look. Often stylish casual or suited.",
  },
  {
    id: "ryan-gosling",
    name: "Ryan Gosling",
    aliases: ["ryan gosling"],
    gender: "male",
    category: "int_actor",
    nationality: "ca",
    visual_description:
      "Canadian actor (Drive, La La Land, Barbie). Male, ~1.84m, muscular lean. Dirty blonde hair, blue-gray eyes, strong jaw, slight stubble. Effortlessly cool style.",
  },
  {
    id: "tom-cruise",
    name: "Tom Cruise",
    aliases: ["tom cruise"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American action star (Mission Impossible, Top Gun). Male, ~1.70m, compact very athletic. Brown hair, brown eyes, symmetrical smile. Always immaculate: suit or action gear.",
  },
  {
    id: "keanu-reeves",
    name: "Keanu Reeves",
    aliases: ["keanu reeves"],
    gender: "male",
    category: "int_actor",
    nationality: "ca",
    visual_description:
      "Canadian actor (The Matrix, John Wick). Male, ~1.86m, lean athletic. Long black hair, dark eyes, beard. Stoic calm face. Black tactical clothing or casual.",
  },
  {
    id: "leonardo-dicaprio",
    name: "Leonardo DiCaprio",
    aliases: ["leonardo dicaprio", "leo dicaprio", "leo"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American Oscar-winning actor. Male, ~1.83m, slim. Blonde-brown hair, blue eyes. Handsome face, slight beard in recent years. Smart-casual or suited.",
  },
  {
    id: "johnny-depp",
    name: "Johnny Depp",
    aliases: ["johnny depp"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American actor (Jack Sparrow, Edward Scissorhands). Male, ~1.78m, slim. Dark brown hair, dark eyes, often extensive beard and mustache. Bohemian style: rings, scarves, hat.",
  },
  {
    id: "will-smith",
    name: "Will Smith",
    aliases: ["will smith", "fresh prince"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American actor and rapper. Male, ~1.88m, athletic muscular. Black skin, brown eyes, shaved head or close fade. Wide smile. Streetwear or suited.",
  },
  {
    id: "denzel-washington",
    name: "Denzel Washington",
    aliases: ["denzel washington", "denzel"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American Oscar-winning actor. Male, ~1.85m, athletic. Black skin, brown eyes, short hair. Commanding powerful presence. Often suited or in action roles.",
  },
  {
    id: "morgan-freeman",
    name: "Morgan Freeman",
    aliases: ["morgan freeman"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American legendary actor. Male, ~1.88m, tall slim. Gray hair and beard, brown eyes, freckled skin. Wise distinguished face. Elegant suit or casual.",
  },
  {
    id: "samuel-l-jackson",
    name: "Samuel L. Jackson",
    aliases: ["samuel l jackson", "samuel jackson", "sam jackson"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American iconic actor (Pulp Fiction, Marvel Nick Fury). Male, ~1.82m, athletic slim. Black skin, brown eyes. Shaved head or very short gray hair. Often in suit or tactical gear. Intense stare.",
  },
  {
    id: "robert-de-niro",
    name: "Robert De Niro",
    aliases: ["robert de niro", "de niro"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American legendary actor (Taxi Driver, The Godfather Part II). Male, ~1.77m, normal build. Brown/gray hair, brown eyes, intense gaze. Angular face. Suited or casual.",
  },
  {
    id: "al-pacino",
    name: "Al Pacino",
    aliases: ["al pacino"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American legendary actor (Scarface, The Godfather). Male, ~1.70m, slim. Dark brown/gray hair, dark eyes, olive Italian-American skin. Intense passionate face. Suited or open-collar shirt.",
  },
  {
    id: "robert-downey-jr",
    name: "Robert Downey Jr.",
    aliases: ["robert downey jr", "rdj", "iron man"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American actor (Iron Man, Sherlock Holmes). Male, ~1.74m, lean muscular. Dark brown hair, brown eyes, neat goatee. Sharp wit in his expression. Smart-casual or suit.",
  },
  {
    id: "chris-evans",
    name: "Chris Evans",
    aliases: ["chris evans", "captain america"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American actor (Captain America). Male, ~1.83m, very muscular. Brown hair, blue eyes, square jaw, beard. Classic American handsome look. Casual or suited.",
  },
  {
    id: "chris-hemsworth",
    name: "Chris Hemsworth",
    aliases: ["chris hemsworth", "thor"],
    gender: "male",
    category: "int_actor",
    nationality: "au",
    visual_description:
      "Australian actor (Thor). Male, ~1.90m, extremely muscular. Blonde hair, blue eyes, full beard. Viking-god physique. Casual or action gear.",
  },
  {
    id: "chris-pratt",
    name: "Chris Pratt",
    aliases: ["chris pratt", "star-lord"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American actor (Guardians of the Galaxy, Jurassic World). Male, ~1.88m, muscular tall. Brown hair, blue eyes, beard. Boy-next-door handsome. Casual or action gear.",
  },
  {
    id: "chris-pine",
    name: "Chris Pine",
    aliases: ["chris pine"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American actor (Wonder Woman, Star Trek). Male, ~1.83m, lean athletic. Brown hair, vivid blue eyes, beard. Classic Hollywood handsome. Smart-casual or suited.",
  },
  {
    id: "dwayne-johnson",
    name: "Dwayne Johnson",
    aliases: ["the rock", "dwayne johnson"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American actor and wrestler (The Rock). Male, ~1.96m, massive extremely muscular. Black skin, brown eyes, shaved head. Tattoo sleeve on left arm. Huge physique in t-shirt or suit.",
  },
  {
    id: "jason-statham",
    name: "Jason Statham",
    aliases: ["jason statham"],
    gender: "male",
    category: "int_actor",
    nationality: "uk",
    visual_description:
      "British action star (Transporter, Fast & Furious). Male, ~1.77m, very muscular compact. Shaved head, blue eyes, stubble. Tough rugged face. Black t-shirt or suit.",
  },
  {
    id: "vin-diesel",
    name: "Vin Diesel",
    aliases: ["vin diesel"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American actor (Fast & Furious). Male, ~1.82m, massive muscular. Shaved head, brown eyes, olive mixed-race skin. Imposing square face. Black sleeveless shirt or suit.",
  },
  {
    id: "tom-hardy",
    name: "Tom Hardy",
    aliases: ["tom hardy"],
    gender: "male",
    category: "int_actor",
    nationality: "uk",
    visual_description:
      "British actor (Bane, Venom, Mad Max). Male, ~1.75m, compact extremely muscular. Brown hair, blue eyes, heavy jaw. Intense brooding expression. Often in black or tactical outfit.",
  },
  {
    id: "liam-neeson",
    name: "Liam Neeson",
    aliases: ["liam neeson"],
    gender: "male",
    category: "int_actor",
    nationality: "uk",
    visual_description:
      "Irish-American action actor (Taken). Male, ~1.93m, very tall lean. Gray hair, blue eyes, craggy lined face. Serious imposing presence. Overcoat or suit.",
  },
  {
    id: "sylvester-stallone",
    name: "Sylvester Stallone",
    aliases: ["sylvester stallone", "stallone", "rocky", "rambo"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American action legend (Rocky, Rambo). Male, ~1.77m, extremely muscular. Brown/gray hair, brown eyes, drooping lower face. Iconic strong jaw. Often in action gear or suit.",
  },
  {
    id: "arnold-schwarzenegger",
    name: "Arnold Schwarzenegger",
    aliases: ["arnold schwarzenegger", "arnie", "terminator"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "Austrian-American actor and bodybuilder (Terminator). Male, ~1.88m, massive iconic muscular body. Brown/gray hair, blue eyes, square Austrian jaw. Strong accent. Action gear or suit.",
  },
  {
    id: "mark-wahlberg",
    name: "Mark Wahlberg",
    aliases: ["mark wahlberg", "marky mark"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American actor (Transformers, The Departed). Male, ~1.73m, very muscular compact. Brown hair, blue eyes, square jaw. Boston tough-guy look. Casual or suited.",
  },
  {
    id: "matt-damon",
    name: "Matt Damon",
    aliases: ["matt damon"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American actor (Jason Bourne, Good Will Hunting). Male, ~1.78m, lean athletic. Brown hair, blue eyes. Clean-cut all-American face. Smart-casual or action gear.",
  },
  {
    id: "ben-affleck",
    name: "Ben Affleck",
    aliases: ["ben affleck", "batman"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American actor and director (Batman, Gone Girl). Male, ~1.89m, tall muscular. Dark brown hair, brown eyes, square jaw, beard. Serious face. Suited or casual.",
  },
  {
    id: "george-clooney",
    name: "George Clooney",
    aliases: ["george clooney"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American actor (Ocean's Eleven). Male, ~1.80m, slim athletic. Silver-gray hair, brown eyes. Classic distinguished handsome. Suit or casual chic.",
  },
  {
    id: "harrison-ford",
    name: "Harrison Ford",
    aliases: ["harrison ford", "han solo", "indiana jones"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American legendary actor (Star Wars, Indiana Jones). Male, ~1.85m, lean. Gray hair, brown eyes, chin scar. Grizzled adventure look. Leather jacket or suit.",
  },
  {
    id: "ryan-reynolds",
    name: "Ryan Reynolds",
    aliases: ["ryan reynolds", "deadpool"],
    gender: "male",
    category: "int_actor",
    nationality: "ca",
    visual_description:
      "Canadian actor (Deadpool, Free Guy). Male, ~1.87m, tall lean muscular. Brown hair, blue-green eyes, sharp jaw, stubble. Witty charming face. Smart-casual or suited.",
  },
  {
    id: "jake-gyllenhaal",
    name: "Jake Gyllenhaal",
    aliases: ["jake gyllenhaal"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American actor (Nightcrawler, Spider-Man). Male, ~1.83m, lean muscular. Brown hair, intense blue eyes, beard. Piercing gaze. Casual or suited.",
  },
  {
    id: "joaquin-phoenix",
    name: "Joaquin Phoenix",
    aliases: ["joaquin phoenix", "joker"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American Oscar-winning actor (Joker, Her). Male, ~1.73m, slim. Dark wavy hair, green eyes, distinctive upper lip scar. Intense raw expression. Simple dark clothing.",
  },
  {
    id: "cillian-murphy",
    name: "Cillian Murphy",
    aliases: ["cillian murphy", "peaky blinders"],
    gender: "male",
    category: "int_actor",
    nationality: "ie",
    visual_description:
      "Irish actor (Peaky Blinders, Oppenheimer). Male, ~1.78m, slim. Brown hair, piercing icy blue eyes, sharp cheekbones. Striking intense face. Period or casual.",
  },
  {
    id: "christian-bale",
    name: "Christian Bale",
    aliases: ["christian bale", "batman bale"],
    gender: "male",
    category: "int_actor",
    nationality: "uk",
    visual_description:
      "British actor (Batman, The Dark Knight). Male, ~1.83m, extremely variable physique (from skeletal to muscular). Brown hair, blue eyes. Intense method-actor expression.",
  },
  {
    id: "daniel-craig",
    name: "Daniel Craig",
    aliases: ["daniel craig", "james bond"],
    gender: "male",
    category: "int_actor",
    nationality: "uk",
    visual_description:
      "British actor (James Bond). Male, ~1.78m, compact very muscular. Blonde hair, blue eyes, square rugged jaw. Stoic tough expression. Suit or action gear.",
  },
  {
    id: "hugh-jackman",
    name: "Hugh Jackman",
    aliases: ["hugh jackman", "wolverine"],
    gender: "male",
    category: "int_actor",
    nationality: "au",
    visual_description:
      "Australian actor (Wolverine, Logan). Male, ~1.88m, extremely muscular. Brown hair, brown eyes, distinctive mutton chop sideburns for Wolverine. Intense animal look or elegant theatrical.",
  },
  {
    id: "benedict-cumberbatch",
    name: "Benedict Cumberbatch",
    aliases: ["benedict cumberbatch", "sherlock", "doctor strange"],
    gender: "male",
    category: "int_actor",
    nationality: "uk",
    visual_description:
      "British actor (Sherlock, Doctor Strange). Male, ~1.84m, slim. Brown hair, blue-green eyes, distinctive angular features, strong nose. Aristocratic British face. Suited or academic.",
  },
  {
    id: "tom-hiddleston",
    name: "Tom Hiddleston",
    aliases: ["tom hiddleston", "loki"],
    gender: "male",
    category: "int_actor",
    nationality: "uk",
    visual_description:
      "British actor (Loki). Male, ~1.88m, tall slim. Light brown hair, blue eyes, sharp patrician features. Charming sharp smile. Elegant suited or Nordic costume.",
  },
  {
    id: "jeremy-renner",
    name: "Jeremy Renner",
    aliases: ["jeremy renner", "hawkeye"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American actor (Hawkeye, The Hurt Locker). Male, ~1.75m, very muscular compact. Brown hair, hazel eyes, beard. Rugged intense look. Tactical or casual.",
  },
  {
    id: "idris-elba",
    name: "Idris Elba",
    aliases: ["idris elba"],
    gender: "male",
    category: "int_actor",
    nationality: "uk",
    visual_description:
      "British actor (Luther, The Wire). Male, ~1.89m, very tall muscular. Black skin, brown eyes, bald or very short hair, beard. Commanding imposing presence. Suit or casual.",
  },
  {
    id: "michael-b-jordan",
    name: "Michael B. Jordan",
    aliases: ["michael b jordan", "michael b. jordan", "creed"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American actor (Creed, Black Panther). Male, ~1.80m, extremely muscular athletic. Black skin, brown eyes, neat beard. Handsome confident face. Streetwear or suited.",
  },
  {
    id: "gary-oldman",
    name: "Gary Oldman",
    aliases: ["gary oldman"],
    gender: "male",
    category: "int_actor",
    nationality: "uk",
    visual_description:
      "British character actor (Léon, The Dark Knight, Darkest Hour). Male, ~1.75m, slim. Brown/gray hair, blue eyes. Versatile chameleon face. Suited or in character.",
  },
  {
    id: "colin-farrell",
    name: "Colin Farrell",
    aliases: ["colin farrell"],
    gender: "male",
    category: "int_actor",
    nationality: "ie",
    visual_description:
      "Irish actor. Male, ~1.73m, lean athletic. Dark brown hair, dark blue eyes, heavy eyebrows, beard. Rugged Irish look. Casual or suited.",
  },
  {
    id: "adam-driver",
    name: "Adam Driver",
    aliases: ["adam driver", "kylo ren"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American actor (Marriage Story, Star Wars Kylo Ren). Male, ~1.90m, very tall lean. Dark hair, dark eyes, unusually angular face with large nose. Distinctive striking look. Simple dark clothing.",
  },
  {
    id: "timothee-chalamet",
    name: "Timothée Chalamet",
    aliases: ["timothee chalamet", "timothée chalamet"],
    gender: "male",
    category: "int_actor",
    nationality: "fr",
    visual_description:
      "French-American actor (Dune, Call Me By Your Name). Male, ~1.79m, very slim. Brown curly hair, brown eyes. Youthful delicate features. Avant-garde high-fashion or casual.",
  },
  {
    id: "robert-pattinson",
    name: "Robert Pattinson",
    aliases: ["robert pattinson", "batman pattinson", "twilight"],
    gender: "male",
    category: "int_actor",
    nationality: "uk",
    visual_description:
      "British actor (The Batman, Twilight). Male, ~1.85m, lean. Brown hair, dark blue eyes, sharp cheekbones. Brooding intense look. Dark aesthetic clothing or suited.",
  },
  {
    id: "andrew-garfield",
    name: "Andrew Garfield",
    aliases: ["andrew garfield", "andrew garfiled", "spider-man garfield"],
    gender: "male",
    category: "int_actor",
    nationality: "uk",
    visual_description:
      "British-American actor (Spider-Man, Silence). Male, ~1.79m, slim. Brown hair, brown eyes, boyish face. Earnest warm expression. Casual or suited.",
  },
  {
    id: "tobey-maguire",
    name: "Tobey Maguire",
    aliases: ["tobey maguire", "spider-man maguire"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American actor (Spider-Man, The Great Gatsby). Male, ~1.75m, slim. Brown hair, blue eyes, baby face. Gentle boyish look. Casual.",
  },
  {
    id: "daniel-radcliffe",
    name: "Daniel Radcliffe",
    aliases: ["daniel radcliffe", "harry potter"],
    gender: "male",
    category: "int_actor",
    nationality: "uk",
    visual_description:
      "British actor (Harry Potter). Male, ~1.65m, small slim. Dark hair, blue eyes. Young boyish face. Casual.",
  },
  {
    id: "jackie-chan",
    name: "Jackie Chan",
    aliases: ["jackie chan"],
    gender: "male",
    category: "int_actor",
    nationality: "hk",
    visual_description:
      "Hong Kong martial arts actor. Male, ~1.74m, muscular compact. Black/gray hair, brown eyes, East Asian features. Round jovial face. Martial arts gear or casual.",
  },
  {
    id: "willem-dafoe",
    name: "Willem Dafoe",
    aliases: ["willem dafoe", "green goblin"],
    gender: "male",
    category: "int_actor",
    nationality: "us",
    visual_description:
      "American character actor (Platoon, Spider-Man Green Goblin). Male, ~1.71m, wiry. Brown hair, deep-set intense eyes. Distinctive gaunt angular face. Unsettling expressive gaze.",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // MONTRES DE LUXE — RÉFÉRENCES VISUELLES
  // Rolex | Audemars Piguet | Hublot | Patek Philippe | Richard Mille
  // Les entrées plus spécifiques sont placées avant les génériques pour
  // éviter les faux positifs (ex. "Nautilus Chrono" avant "Nautilus").
  // ──────────────────────────────────────────────────────────────────────────

  // ROLEX
  {
    id: "cosmograph-daytona",
    name: "Cosmograph Daytona",
    aliases: ["rolex daytona", "daytona chronograph", "daytona rolex"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex Cosmograph Daytona ref 116500LN. 40mm stainless steel, black ceramic tachymeter bezel, black dial with three white sub-counters (30min at 3, hours at 6, seconds at 9). Oyster bracelet. Iconic racing chronograph.",
  },
  {
    id: "day-date-president",
    name: "Day-Date President",
    aliases: ["rolex president", "day-date rolex", "presidential rolex", "day date president"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex Day-Date 40 ref 228238. 40mm 18k yellow gold, fluted gold bezel, champagne or lacquer dial, day spelled out at 12, date at 3. Exclusive President bracelet with semi-circular three-piece links. The prestige dress watch.",
  },
  {
    id: "datejust-41",
    name: "Datejust 41",
    aliases: ["rolex datejust", "datejust rolex", "datejust 41 rolex"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex Datejust 41 ref 126333. 41mm two-tone steel and yellow gold (Rolesor), fluted gold bezel, silver Roman numeral dial, date at 3 with cyclops lens. Jubilee bracelet.",
  },
  {
    id: "gmt-master-ii-batman",
    name: "GMT-Master II Batman",
    aliases: ["rolex batman", "gmt batman", "rolex gmt batman"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex GMT-Master II ref 126710BLNR 'Batman'. 40mm stainless steel, black and blue ceramic bezel with 24h scale, black dial, red GMT hand, date at 3. Jubilee bracelet. Nicknamed 'Batman' for its black-blue color scheme.",
  },
  {
    id: "gmt-master-ii-pepsi",
    name: "GMT-Master II Pepsi",
    aliases: ["rolex pepsi", "gmt pepsi", "rolex gmt pepsi"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex GMT-Master II ref 126710BLRO 'Pepsi'. 40mm stainless steel, red and blue ceramic bezel with 24h scale, black dial, red GMT hand, date at 3. Jubilee bracelet. Iconic pilot's watch with Pepsi red-blue bezel.",
  },
  {
    id: "submariner-date",
    name: "Submariner Date",
    aliases: ["rolex submariner", "submariner rolex", "sub rolex"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex Submariner Date ref 126610LN. 41mm stainless steel, unidirectional rotating black ceramic bezel with 60-minute scale, matte black dial, date at 3, luminous Mercedes hands. Oyster bracelet. The definitive diver's watch.",
  },
  {
    id: "submariner-hulk",
    name: "Submariner Hulk",
    aliases: ["rolex hulk", "green submariner", "hulk rolex"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex Submariner Date ref 116610LV 'Hulk'. 40mm stainless steel, vivid green ceramic bezel, brilliant green lacquer dial, date at 3. Oyster bracelet. Nicknamed 'Hulk' for all-green look. Discontinued and highly coveted.",
  },
  {
    id: "yacht-master-40",
    name: "Yacht-Master 40",
    aliases: ["rolex yacht-master", "yacht master rolex", "yacht-master rolex"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex Yacht-Master 40 ref 126622. 40mm two-tone steel and platinum (Rolesium), bidirectional rotating platinum bezel, slate grey rhodium dial, date at 3. Oyster bracelet. Nautical sports elegance.",
  },
  {
    id: "sea-dweller",
    name: "Sea-Dweller",
    aliases: ["rolex sea-dweller", "sea dweller rolex"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex Sea-Dweller ref 126600. 43mm stainless steel, unidirectional black ceramic bezel, matte black dial, date at 3 (no cyclops), helium escape valve at 9. Oyster bracelet. Professional diver's watch, water-resistant to 1220m.",
  },
  {
    id: "explorer-ii",
    name: "Explorer II",
    aliases: ["rolex explorer ii", "rolex explorer 2"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex Explorer II ref 226570. 42mm stainless steel, white dial, fixed 24-hour bezel, orange 24h GMT hand, date at 3. Oyster bracelet. Designed for caves and polar expeditions.",
  },
  {
    id: "milgauss",
    name: "Milgauss",
    aliases: ["rolex milgauss"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex Milgauss ref 116400GV. 40mm stainless steel, green sapphire crystal, Z-blue or black dial, distinctive orange lightning bolt seconds hand. Oyster bracelet. Anti-magnetic watch designed for scientists.",
  },
  {
    id: "oyster-perpetual",
    name: "Oyster Perpetual",
    aliases: ["rolex oyster perpetual", "oyster perpetual rolex"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex Oyster Perpetual ref 126000. 36mm stainless steel, smooth polished bezel, vivid color dial (coral red, turquoise blue, candy pink, or yellow). Oyster bracelet. Rolex's purest watch: no complications, pure form.",
  },
  {
    id: "air-king",
    name: "Air-King",
    aliases: ["rolex air-king", "rolex air king"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex Air-King ref 126900. 40mm stainless steel, smooth bezel, black dial with large Arabic numerals at 3, 6, 9 in yellow, railway-track minute scale. Oyster bracelet. Aviation heritage tribute to RAF pilots.",
  },

  // AUDEMARS PIGUET — Royal Oak Jumbo avant Royal Oak
  {
    id: "royal-oak-jumbo",
    name: "Royal Oak Jumbo",
    aliases: ["ap royal oak jumbo", "royal oak extra thin", "royal oak 15202", "jumbo ap"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Audemars Piguet Royal Oak 'Jumbo' Extra-Thin ref 15202. 39mm stainless steel, iconic octagonal bezel with 8 hex screws, Grande Tapisserie dial, integrated steel bracelet. Ultra-thin 8.1mm. Original Gerald Genta 1972 design.",
  },
  {
    id: "code-1159-chrono",
    name: "Code 11.59 Chrono",
    aliases: ["ap code 11.59", "code 11.59 audemars", "audemars code 11.59"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Audemars Piguet Code 11.59 Chronographe ref 26393. 41mm, double-curved sapphire crystal, round outer case with octagonal middle case, multi-layered skeletonized or lacquered dial, 'double AP' crown. Modern AP beyond Royal Oak.",
  },
  {
    id: "royal-oak",
    name: "Royal Oak",
    aliases: ["ap royal oak", "audemars piguet royal oak", "royal oak ap", "audemars piguet"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Audemars Piguet Royal Oak ref 15500. 41mm stainless steel, iconic octagonal bezel with 8 hexagonal screws, Grande Tapisserie dial (fine raised squares), integrated 'bracelet of steel'. Gerald Genta 1972 — the first luxury sports watch.",
  },

  // HUBLOT — Unico et Spirit avant Big Bang
  {
    id: "big-bang-unico",
    name: "Big Bang Unico",
    aliases: ["hublot big bang unico", "big bang unico hublot"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Hublot Big Bang Unico 42mm titanium. Satin-brushed titanium case, black or ceramic bezel with H-shaped titanium screws, skeletonized dial showing the UNICO in-house flyback chronograph movement. Black rubber strap. Futuristic porthole design.",
  },
  {
    id: "spirit-of-big-bang",
    name: "Spirit of Big Bang",
    aliases: ["hublot spirit of big bang", "spirit big bang hublot"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Hublot Spirit of Big Bang Tourbillon. Distinctive tonneau (barrel-shaped) case 45×39mm, skeletonized movement visible through both sapphires, tourbillon at 6. Titanium or Magic Gold. Radical barrel shape departing from the round Big Bang.",
  },
  {
    id: "classic-fusion",
    name: "Classic Fusion",
    aliases: ["hublot classic fusion", "classic fusion hublot"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Hublot Classic Fusion 45mm titanium. Minimalist design, clean satin-brushed titanium case, simple dark or grey dial, slim profile, rubber strap. Hublot's restrained and elegant counterpart to the Big Bang.",
  },
  {
    id: "big-bang",
    name: "Big Bang",
    aliases: ["hublot big bang", "hublot"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Hublot Big Bang ref 341. 44mm titanium and rubber, bold porthole-inspired case, bezel with 6 H-screws, skeletonized or dark dial, black rubber strap. The original disruptive 'art of fusion' watch — bold, oversized, futuristic.",
  },

  // PATEK PHILIPPE — Nautilus Chrono avant Nautilus
  {
    id: "nautilus-chrono",
    name: "Nautilus Chrono",
    aliases: ["patek nautilus chronographe", "nautilus 5980", "nautilus chronograph patek"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Patek Philippe Nautilus Chronographe ref 5980/1A. 40.5mm stainless steel, integrated bracelet, blue or black horizontal-stripe dial, fly-back chronograph, date at 3. The most complicated Nautilus, extremely rare.",
  },
  {
    id: "quantieme-perpetuel-chrono",
    name: "Quantieme Perpetuel Chrono",
    aliases: ["patek 5970", "patek perpetual calendar chronograph", "perpetuel patek"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Patek Philippe Quantième Perpétuel Chronographe ref 5970. 40mm round case, perpetual calendar (day/date/month/leap year) with split-seconds chronograph, moonphase at 6. Sector-style dial. Grand complication.",
  },
  {
    id: "nautilus",
    name: "Nautilus",
    aliases: ["patek nautilus", "patek philippe nautilus", "nautilus 5711", "patek 5711"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Patek Philippe Nautilus ref 5711 or 5726. 40mm stainless steel, porthole-inspired rounded-octagonal case, iconic horizontal-embossed blue or olive green dial, integrated steel bracelet. Gerald Genta 1976. The most legendary sports watch.",
  },
  {
    id: "aquanaut",
    name: "Aquanaut",
    aliases: ["patek aquanaut", "patek philippe aquanaut", "aquanaut 5167"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Patek Philippe Aquanaut ref 5167A. 40mm stainless steel, rounded octagonal case, black or khaki embossed checkerboard dial matching the tropical composite strap. Younger and sportier alternative to the Nautilus.",
  },
  {
    id: "calatrava",
    name: "Calatrava",
    aliases: ["patek calatrava", "patek philippe calatrava"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Patek Philippe Calatrava ref 5227. 39mm yellow or white gold, classic round dress watch, clean cream dial with slim applied markers, elegant dauphine hands, crocodile leather strap. The quintessential dress watch since 1932.",
  },
  {
    id: "twenty-4",
    name: "Twenty 4",
    aliases: ["patek twenty 4", "patek philippe twenty 4", "twenty~4 patek"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Patek Philippe Twenty~4 ref 7300. Ladies' quartz, rectangular or cushion tonneau-shaped case, diamond-set bezel, integrated bracelet in steel or rose gold. Patek's premier ladies' watch.",
  },

  // RICHARD MILLE
  {
    id: "mp-05-laferrari",
    name: "MP-05 LaFerrari",
    aliases: ["richard mille mp05", "rm mp-05", "richard mille laferrari"],
    gender: "group",
    category: "luxury_watch",
    nationality: "fr",
    visual_description:
      "Richard Mille RM MP-05 LaFerrari. Dramatically elongated tonneau case, 11 barrels in series (50-day power reserve), horizontally stacked cylindrical architecture mirroring a Ferrari engine. NTPT Carbon or sapphire case. Ultra-limited extreme engineering.",
  },
  {
    id: "rm-027-tourbillon-nadal",
    name: "RM 027 Tourbillon Nadal",
    aliases: ["richard mille rm 027", "rm027 nadal", "rm 027"],
    gender: "group",
    category: "luxury_watch",
    nationality: "fr",
    visual_description:
      "Richard Mille RM 027 Tourbillon Rafael Nadal. Ultra-light LITAL alloy case (~20g total), skeletonized tourbillon movement, designed to survive tennis matches. Shock-resistant, featherweight extreme sports watch.",
  },
  {
    id: "rm-035-rafael-nadal",
    name: "RM 035 Rafael Nadal",
    aliases: ["richard mille rm 035", "rm035 nadal", "rm 035"],
    gender: "group",
    category: "luxury_watch",
    nationality: "fr",
    visual_description:
      "Richard Mille RM 035 Rafael Nadal. HTLC or Quartz TPT case in white or beige, skeletonized automatic movement, engineered for extreme sports. Very light (~33g), shock-resistant structure.",
  },
  {
    id: "rm-011-felipe-massa",
    name: "RM 011 Felipe Massa",
    aliases: ["richard mille rm 011", "rm011 massa", "rm 011"],
    gender: "group",
    category: "luxury_watch",
    nationality: "fr",
    visual_description:
      "Richard Mille RM 011 Felipe Massa. NTPT Carbon or titanium case, oversized flyback chronograph pusher, annual calendar, skeletonized movement. Formula 1 inspired, named after Ferrari driver Felipe Massa. Bold motorsport aesthetic.",
  },
  {
    id: "rm-055-bubba-watson",
    name: "RM 055 Bubba Watson",
    aliases: ["richard mille rm 055", "rm055 watson", "rm 055"],
    gender: "group",
    category: "luxury_watch",
    nationality: "fr",
    visual_description:
      "Richard Mille RM 055 Bubba Watson. White NTPT Quartz case, skeletonized manual-wind movement, golf-inspired, worn by PGA golfer Bubba Watson. White and translucent aesthetic, ultra-light.",
  },
  {
    id: "rm-67-01-extra-flat",
    name: "RM 67-01 Extra Flat",
    aliases: ["richard mille rm 67", "rm67-01", "richard mille extra flat"],
    gender: "group",
    category: "luxury_watch",
    nationality: "fr",
    visual_description:
      "Richard Mille RM 67-01 Extra Flat. Tonneau-shaped case in brushed titanium or NTPT carbon, ultra-slim 7.75mm profile — the thinnest RM. Skeletonized automatic movement. Richard Mille's elegant dress-sport watch.",
  },

  // CARTIER
  {
    id: "ballon-bleu",
    name: "Ballon Bleu",
    aliases: ["cartier ballon bleu", "ballon bleu de cartier"],
    gender: "group",
    category: "luxury_watch",
    nationality: "fr",
    visual_description:
      "Cartier Ballon Bleu 42mm. Round stainless steel or gold case with iconic floating crown protected by an integrated cabochon, clean white or silver sunray dial, Roman numeral markers, blued-steel sword hands. Leather strap or steel bracelet. Cartier's signature contemporary dress watch.",
  },
  {
    id: "panthere",
    name: "Panthère",
    aliases: ["cartier panthere", "panthere de cartier", "panther cartier"],
    gender: "group",
    category: "luxury_watch",
    nationality: "fr",
    visual_description:
      "Cartier Panthère de Cartier. Square tonneau-shaped case in yellow gold or steel, guilloche or lacquer dial, Roman numerals, integrated 'grain de riz' bracelet. Iconic 1983 Cartier design — elegantly feminine, linked chain bracelet.",
  },
  {
    id: "santos",
    name: "Santos",
    aliases: ["cartier santos", "santos de cartier", "santos dumont"],
    gender: "group",
    category: "luxury_watch",
    nationality: "fr",
    visual_description:
      "Cartier Santos Large ref WSSA0018. 39.8mm steel or gold, iconic visible screws on bezel and integrated bracelet, square dial with Roman numerals, blued-steel sword hands. QuickSwitch interchangeable strap system. The world's first men's wristwatch (1904).",
  },
  {
    id: "tank",
    name: "Tank",
    aliases: ["cartier tank", "tank cartier", "tank solo", "tank must"],
    gender: "group",
    category: "luxury_watch",
    nationality: "fr",
    visual_description:
      "Cartier Tank Must or Solo. Rectangular case in steel, yellow gold, or vermeil, inspired by WWI tank tracks, thin profile, white or ivory dial with Roman numerals, blued-steel sword hands, brown leather strap. Timeless geometric Cartier icon since 1917.",
  },

  // IWC SCHAFFHAUSEN
  {
    id: "big-pilot",
    name: "Big Pilot",
    aliases: ["iwc big pilot", "big pilot iwc", "iwc 5002"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "IWC Big Pilot ref IW501001. 46.2mm stainless steel, bold crown onion-shaped, black dial with large Arabic numerals, white luminous hands and indices, big date at 12. Leather pilot strap. Inspired by WWII Luftwaffe navigation watches — oversized, legible, powerful.",
  },
  {
    id: "portugieser-chrono",
    name: "Portugieser Chrono",
    aliases: ["iwc portugieser", "portugieser chronograph", "iwc portugieser chronograph"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "IWC Portugieser Chronograph ref IW371601. 41mm stainless steel, clean white dial, Arabic numerals, two grey sub-counters (12h at 9, continuous seconds at 3), column wheel visible at 6. Leather strap. Elegant sport-dress chrono with vintage navigator aesthetic.",
  },

  // TAG HEUER
  {
    id: "carrera",
    name: "Carrera",
    aliases: ["tag heuer carrera", "carrera tag heuer", "heuer carrera"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "TAG Heuer Carrera Chronograph ref CBN2A10. 44mm stainless steel, tachymeter bezel, black or silver dial with three sub-counters, date at 6. Steel bracelet or leather strap. Jack Heuer's 1963 racing legend — clean, sporty, motorsport DNA.",
  },
  {
    id: "monaco",
    name: "Monaco",
    aliases: ["tag heuer monaco", "monaco tag heuer", "heuer monaco"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "TAG Heuer Monaco ref CAW211P. 39mm square blue lacquer dial, prominent crown at 9, white subdials, steel case with integrated bracelet or strap. Made famous by Steve McQueen in Le Mans (1971). First automatic chronograph with square waterproof case.",
  },

  // TUDOR
  {
    id: "black-bay-58",
    name: "Black Bay 58",
    aliases: ["tudor black bay 58", "tudor black bay", "bb58 tudor"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Tudor Black Bay 58 ref M79030N. 39mm stainless steel, compact vintage-inspired diver, unidirectional rotating bezel with black aluminium insert, matte black dial with snowflake hands and gilt indices, Pearlmaster bracelet or fabric strap. Tudor's most wearable diver.",
  },

  // OMEGA
  {
    id: "speedmaster-moonwatch",
    name: "Speedmaster Moonwatch",
    aliases: ["omega speedmaster", "speedmaster moonwatch omega", "moonwatch", "omega speedmaster professional"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Omega Speedmaster Professional Moonwatch ref 310.30.42.50.01.001. 42mm stainless steel, black tachymeter bezel with aluminium insert, black step dial with three white sub-counters (minutes at 9, hours at 6, seconds at 3), hesalite crystal. Steel bracelet. Worn on the Moon — NASA's official watch since 1965.",
  },
  {
    id: "seamaster-diver-300m",
    name: "Seamaster Diver 300M",
    aliases: ["omega seamaster diver", "seamaster 300m omega", "seamaster diver omega"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Omega Seamaster Diver 300M ref 210.30.42.20.01.001. 42mm stainless steel, ceramic unidirectional bezel with wave pattern, blue lacquer wave dial, skeleton hands, helium escape valve, steel bracelet. James Bond's watch since 1995. Professional 300m diver.",
  },
  {
    id: "seamaster-planet-ocean",
    name: "Seamaster Planet Ocean",
    aliases: ["omega planet ocean", "planet ocean omega", "seamaster planet ocean omega"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Omega Seamaster Planet Ocean 600M ref 215.30.44.21.01.001. 43.5mm stainless steel, black ceramic bezel with tachymeter scale, black dial, luminous orange hands and indices, screw-down crown, steel bracelet. Professional dive watch, water-resistant 600m.",
  },
  {
    id: "constellation",
    name: "Constellation",
    aliases: ["omega constellation", "constellation omega"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Omega Constellation ref 131.10.39.20.02.001. 39mm stainless steel, distinctive 'claws' on the case, silver dial with Roman numerals, integrated steel bracelet. Iconic since 1952 — Omega's premier dress watch, elegant and understated.",
  },
  {
    id: "de-ville-tresor",
    name: "De Ville Trésor",
    aliases: ["omega de ville tresor", "de ville omega", "de ville tresor"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Omega De Ville Trésor ref 428.53.40.21.09.001. 40mm rose gold or steel, cushion-shaped case, silver or lacquered dial with Roman numerals, hand-wound co-axial movement, alligator leather strap. Omega's most elegant dress watch — slim, refined, vintage-inspired.",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // MONTRES DE LUXE — AJOUTS (variantes Storage celebrity-refs)
  // ──────────────────────────────────────────────────────────────────────────

  // AUDEMARS PIGUET
  {
    id: "royal-oak-concept",
    name: "Royal Oak Concept",
    aliases: ["royal oak concept","audemars piguet royal oak concept"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Audemars Piguet Royal Oak Concept. Avant-garde sports watch, large ~44mm octagonal tonneau-influenced case in titanium, ceramic or carbon, exposed skeletonized tourbillon movement, openworked dial with 'AP' bridge, rubber strap. Futuristic and ultra-technical.",
  },
  {
    id: "royal-oak-frosted-gold",
    name: "Royal Oak Frosted Gold",
    aliases: ["royal oak frosted gold","audemars piguet royal oak frosted gold"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Audemars Piguet Royal Oak Frosted Gold ref 15454. 37 or 41mm 18k gold with hammered Florentine 'frosted' finish giving a sparkling diamond-dust texture, signature octagonal bezel with eight hexagonal screws, blue or silver 'Grande Tapisserie' dial, integrated gold bracelet.",
  },
  {
    id: "royal-oak-offshore-diver",
    name: "Royal Oak Offshore Diver",
    aliases: ["royal oak offshore diver","audemars piguet royal oak offshore diver"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Audemars Piguet Royal Oak Offshore Diver ref 15720. 42mm steel, oversized octagonal bezel, inner rotating diver's bezel set by a crown at 10, 'Méga Tapisserie' dial (blue, black or colored), rubber strap. Robust sporty diver, 300m.",
  },
  {
    id: "royal-oak-perpetual-calendar",
    name: "Royal Oak Perpetual Calendar",
    aliases: ["royal oak perpetual calendar","audemars piguet royal oak perpetual calendar"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Audemars Piguet Royal Oak Perpetual Calendar ref 26574. 41mm steel or gold, octagonal bezel with eight screws, blue 'Grande Tapisserie' dial with sub-dials for day, date, month, moonphase, leap-year and week, integrated bracelet. Grand complication in iconic Royal Oak form.",
  },
  // CARTIER
  {
    id: "baignoire",
    name: "Baignoire",
    aliases: ["baignoire","cartier baignoire"],
    gender: "group",
    category: "luxury_watch",
    nationality: "fr",
    visual_description:
      "Cartier Baignoire. Elongated oval 'bathtub'-shaped case in 18k gold, slim elegant dress watch, white lacquer dial with black Roman numerals, blue sword hands, leather strap. A 1912 design icon, pure curved minimalism.",
  },
  {
    id: "ballon-bleu-or-rose",
    name: "Ballon Bleu Or Rose",
    aliases: ["ballon bleu or rose","cartier ballon bleu or rose"],
    gender: "group",
    category: "luxury_watch",
    nationality: "fr",
    visual_description:
      "Cartier Ballon Bleu in rose gold. Round domed case with a blue sapphire cabochon crown protected by an arc of metal, silver guilloché dial, Roman numerals, blue steel sword hands, rose-gold bracelet or strap. Soft balloon-like profile.",
  },
  {
    id: "cle-de-cartier",
    name: "Clé de Cartier",
    aliases: ["clé de cartier","cartier clé de cartier"],
    gender: "group",
    category: "luxury_watch",
    nationality: "fr",
    visual_description:
      "Cartier Clé de Cartier. Rounded case with a distinctive key-shaped winding crown set with a blue sapphire, silver flinqué dial, Roman numerals, blue sword hands, sleek polished case. Modern elegant unisex line.",
  },
  {
    id: "pasha-chronograph",
    name: "Pasha Chronograph",
    aliases: ["pasha chronograph","cartier pasha chronograph"],
    gender: "group",
    category: "luxury_watch",
    nationality: "fr",
    visual_description:
      "Cartier Pasha de Cartier Chronograph. Round case with a prominent fluted screw-down crown cover on a chain, clous-de-Paris detailing, white dial with Arabic numerals and chronograph counters, steel bracelet. Bold distinctive design.",
  },
  {
    id: "ronde-louis-cartier",
    name: "Ronde Louis Cartier",
    aliases: ["ronde louis cartier","cartier ronde louis cartier"],
    gender: "group",
    category: "luxury_watch",
    nationality: "fr",
    visual_description:
      "Cartier Ronde Louis Cartier. Slim round dress watch in 18k gold or steel, pure round case, white dial with black Roman numerals, railway minute track, blue sword hands, beaded crown with sapphire, leather strap. Understated elegance.",
  },
  {
    id: "santos-skeleton-noire",
    name: "Santos Skeleton Noire",
    aliases: ["santos skeleton noire","cartier santos skeleton noire"],
    gender: "group",
    category: "luxury_watch",
    nationality: "fr",
    visual_description:
      "Cartier Santos de Cartier Skeleton 'Noire'. Square case with rounded corners, exposed skeletonized movement whose bridges form Roman numerals, black ADLC-coated steel, visible gears, integrated bracelet with SmartLink. Stealthy industrial-chic.",
  },
  {
    id: "santos-dumont",
    name: "Santos-Dumont",
    aliases: ["santos-dumont","cartier santos-dumont","cartier santos dumont"],
    gender: "group",
    category: "luxury_watch",
    nationality: "fr",
    visual_description:
      "Cartier Santos-Dumont. Flat slim square case, thin bezel with eight exposed screws, white or champagne dial, black Roman numerals, blue sword hands, leather strap. The original 1904 aviator's watch, refined and very thin.",
  },
  {
    id: "tank-americaine-xl",
    name: "Tank Américaine XL",
    aliases: ["tank américaine xl","cartier tank américaine xl"],
    gender: "group",
    category: "luxury_watch",
    nationality: "fr",
    visual_description:
      "Cartier Tank Américaine XL. Elongated curved rectangular case in 18k gold or steel, vertical brancards, silver dial with black Roman numerals, secret signature, blue sword hands, leather strap. Larger, curvier Tank variant.",
  },
  {
    id: "tank-cintree",
    name: "Tank Cintrée",
    aliases: ["tank cintrée","cartier tank cintrée"],
    gender: "group",
    category: "luxury_watch",
    nationality: "fr",
    visual_description:
      "Cartier Tank Cintrée. Long narrow curved rectangular case hugging the wrist, 18k gold, silvered dial with elongated Roman numerals, blue sword hands, leather strap. The most elegant and rare elongated Tank, a 1921 design.",
  },
  {
    id: "tank-francaise",
    name: "Tank Française",
    aliases: ["tank française","cartier tank française"],
    gender: "group",
    category: "luxury_watch",
    nationality: "fr",
    visual_description:
      "Cartier Tank Française. Rectangular case with rounded brancards integrated into a links bracelet, steel or gold, silver dial with black Roman numerals, secret signature, blue sword hands. Sporty-chic integrated-bracelet Tank.",
  },
  // HUBLOT
  {
    id: "big-bang-ferrari",
    name: "Big Bang Ferrari",
    aliases: ["big bang ferrari","hublot big bang ferrari"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Hublot Big Bang Ferrari. 45mm round case in titanium, King Gold or carbon, prominent exposed H-screws on the bezel, skeletonized dial with Ferrari-inspired flange, integrated chronograph, rubber strap. Bold sports-car aesthetic.",
  },
  {
    id: "big-bang-integral-ceramic",
    name: "Big Bang Integral Ceramic",
    aliases: ["big bang integral ceramic","hublot big bang integral ceramic"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Hublot Big Bang Integral in ceramic. 42mm fully-ceramic case and integrated ceramic bracelet (black, blue or grey), signature porthole bezel with H-shaped titanium screws, skeletonized chronograph dial. Monochrome integrated-bracelet evolution.",
  },
  {
    id: "big-bang-king-power",
    name: "Big Bang King Power",
    aliases: ["big bang king power","hublot big bang king power"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Hublot Big Bang King Power. Oversized ~48mm bold case, thick bezel with six H-screws, carbon, ceramic or titanium, deeply skeletonized chronograph dial, rubber strap. Massive aggressive limited-edition chronograph.",
  },
  {
    id: "big-bang-meca-10",
    name: "Big Bang Meca-10",
    aliases: ["big bang meca-10","hublot big bang meca-10","hublot big bang meca 10"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Hublot Big Bang Meca-10. 45mm case in titanium, ceramic or Magic Gold, exposed rack-and-pinion manual movement inspired by Meccano toys, 10-day power-reserve indicator, skeletonized architectural dial, rubber strap.",
  },
  {
    id: "big-bang-tourbillon",
    name: "Big Bang Tourbillon",
    aliases: ["big bang tourbillon","hublot big bang tourbillon"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Hublot Big Bang Tourbillon. 44mm case, sapphire or skeletonized dial revealing a flying tourbillon at 6, signature porthole bezel with H-screws, titanium, ceramic or sapphire, rubber strap. High-complication Big Bang.",
  },
  {
    id: "classic-fusion-blue-titanium",
    name: "Classic Fusion Blue Titanium",
    aliases: ["classic fusion blue titanium","hublot classic fusion blue titanium"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Hublot Classic Fusion Titanium with blue dial. Slim 42-45mm round titanium case, polished porthole bezel with six H-screws, sunburst blue dial, applied indices, rubber strap. The most elegant, understated Hublot.",
  },
  {
    id: "classic-fusion-orlinski",
    name: "Classic Fusion Orlinski",
    aliases: ["classic fusion orlinski","hublot classic fusion orlinski"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Hublot Classic Fusion Orlinski. Faceted sculpted angular case and bezel designed by artist Richard Orlinski, mirror-polished ceramic or titanium (often colorful), faceted dial, rubber strap. Sculptural art-object watch.",
  },
  {
    id: "mp-07",
    name: "MP-07",
    aliases: ["mp-07","hublot mp-07","hublot mp 07"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Hublot MP-07. Horizontal tonneau case under sapphire crystal, exposed elongated movement with 40-day power reserve, vertically displayed tourbillon and time, futuristic technical architecture, rubber strap. Avant-garde Masterpiece.",
  },
  {
    id: "mp-09-tourbillon-bi-axis",
    name: "MP-09 Tourbillon Bi-Axis",
    aliases: ["mp-09 tourbillon bi-axis","hublot mp-09 tourbillon bi-axis","hublot mp 09 tourbillon bi axis"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Hublot MP-09 Tourbillon Bi-Axis. Tall domed sapphire crystal over a dramatic bi-axial tourbillon, titanium or King Gold case, openworked dial, exposed complex movement, rubber strap. Spectacular kinetic Masterpiece.",
  },
  {
    id: "spirit-of-big-bang-sapphire",
    name: "Spirit of Big Bang Sapphire",
    aliases: ["spirit of big bang sapphire","hublot spirit of big bang sapphire"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Hublot Spirit of Big Bang Sapphire. Tonneau (barrel) case machined entirely from transparent sapphire crystal, skeletonized chronograph movement fully visible floating inside, clear or tinted, rubber strap. Transparent see-through marvel.",
  },
  // PATEK PHILIPPE
  {
    id: "aquanaut-chronograph-5968a",
    name: "Aquanaut Chronograph 5968A",
    aliases: ["aquanaut chronograph 5968a","patek philippe aquanaut chronograph 5968a"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Patek Philippe Aquanaut Chronograph ref 5968A. 42.2mm steel, rounded-octagonal case, embossed black or 'tropical' colored dial with relief grid pattern, flyback chronograph, orange accents, integrated composite 'Tropical' rubber strap.",
  },
  {
    id: "calatrava-pilot-5524",
    name: "Calatrava Pilot 5524",
    aliases: ["calatrava pilot 5524","patek philippe calatrava pilot 5524"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Patek Philippe Calatrava Pilot Travel Time ref 5524. 42mm white or rose gold, vintage aviator style, blue lacquered dial with luminous Arabic numerals and syringe hands, dual time-zone pushers, day/night and date indicators, calfskin strap.",
  },
  {
    id: "golden-ellipse",
    name: "Golden Ellipse",
    aliases: ["golden ellipse","patek philippe golden ellipse"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Patek Philippe Golden Ellipse ref 5738. Elliptical case based on the golden ratio, 18k gold, ebony-black blue-gold sunburst dial, slim gold baton markers and hands, leather strap. A pure 1968 minimalist icon.",
  },
  {
    id: "grandmaster-chime",
    name: "Grandmaster Chime",
    aliases: ["grandmaster chime","patek philippe grandmaster chime"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Patek Philippe Grandmaster Chime ref 6300. Massive reversible double-face gold case, 20 complications including grande and petite sonnerie and minute repeater, two dials (time on one, calendar on the other). Patek's most complicated wristwatch.",
  },
  {
    id: "world-time-5230",
    name: "World Time 5230",
    aliases: ["world time 5230","patek philippe world time 5230"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Patek Philippe World Time ref 5230. 38.5mm gold, hand-guilloché central dial, rotating 24-hour and city rings covering 24 time zones, blue or rose-gold tones, leather strap. The reference elegant world-timer.",
  },
  // RICHARD MILLE
  {
    id: "rm-016",
    name: "RM 016",
    aliases: ["rm 016","richard mille rm 016"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Richard Mille RM 016. Ultra-thin rectangular tonneau case in titanium, gold or carbon, skeletonized automatic movement with variable-geometry rotor, exposed baseplate, rubber strap. Flat technical everyday RM.",
  },
  {
    id: "rm-030",
    name: "RM 030",
    aliases: ["rm 030","richard mille rm 030"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Richard Mille RM 030. Tonneau case in titanium, gold or NTPT carbon, skeletonized automatic movement with a declutchable rotor (engage/disengage indicator), date, exposed grade-5 titanium baseplate, rubber strap.",
  },
  {
    id: "rm-037",
    name: "RM 037",
    aliases: ["rm 037","richard mille rm 037"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Richard Mille RM 037. Feminine tonneau case, often diamond-set, in Carbon TPT, gold or colorful Quartz TPT, skeletonized automatic movement, signature push-button crown, rubber strap. Ladies' RM.",
  },
  {
    id: "rm-07-02-pink-lady",
    name: "RM 07-02 Pink Lady",
    aliases: ["rm 07-02 pink lady","richard mille rm 07-02 pink lady","richard mille rm 07 02 pink lady"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Richard Mille RM 07-02 'Pink Lady Sapphire'. Tonneau case carved from solid pink sapphire crystal, translucent rose tint, skeletonized automatic movement floating inside, gem-set, rubber strap. Spectacular translucent ladies' piece.",
  },
  {
    id: "rm-11-05-gmt",
    name: "RM 11-05 GMT",
    aliases: ["rm 11-05 gmt","richard mille rm 11-05 gmt","richard mille rm 11 05 gmt"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Richard Mille RM 11-05 GMT Flyback Chronograph. Tonneau case in grey Cermet and titanium, skeletonized flyback chronograph with GMT, annual calendar and 60-minute countdown, rubber strap. Racing-inspired automatic chronograph.",
  },
  {
    id: "rm-33-02",
    name: "RM 33-02",
    aliases: ["rm 33-02","richard mille rm 33-02","richard mille rm 33 02"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Richard Mille RM 33-02 Automatic. Round (not tonneau) ultra-thin case in gold or Carbon TPT and titanium, extra-flat skeletonized automatic movement, off-centered crown, leather or rubber strap. RM's dressier round model.",
  },
  {
    id: "rm-50-03-mclaren",
    name: "RM 50-03 McLaren",
    aliases: ["rm 50-03 mclaren","richard mille rm 50-03 mclaren","richard mille rm 50 03 mclaren"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Richard Mille RM 50-03 McLaren F1. Ultralight tonneau case in Graph TPT (graphene) and Carbon TPT, split-seconds tourbillon chronograph, exposed movement, McLaren orange accents, rubber strap. Record-light hypercar watch under 40g.",
  },
  {
    id: "rm-52-05-pharrell",
    name: "RM 52-05 Pharrell",
    aliases: ["rm 52-05 pharrell","richard mille rm 52-05 pharrell","richard mille rm 52 05 pharrell"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Richard Mille RM 52-05 Tourbillon Pharrell Williams. Tonneau case, dial depicting an astronaut helmet against a Martian landscape in 3D, manual tourbillon, Cermet and titanium, rubber strap. Space-themed art collaboration.",
  },
  {
    id: "rm-61-01-yohan-blake",
    name: "RM 61-01 Yohan Blake",
    aliases: ["rm 61-01 yohan blake","richard mille rm 61-01 yohan blake","richard mille rm 61 01 yohan blake"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Richard Mille RM 61-01 Yohan Blake. Tonneau case in green and black Quartz TPT and Carbon TPT, skeletonized automatic movement, sprinter-inspired green-and-yellow Jamaican accents, rubber strap. Athlete signature model.",
  },
  {
    id: "rm-62-01",
    name: "RM 62-01",
    aliases: ["rm 62-01","richard mille rm 62-01","richard mille rm 62 01"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Richard Mille RM 62-01 Tourbillon Vibrating Alarm ACJ. Complex tonneau case, tourbillon with a silent vibrating alarm for travelers, UTC second time zone, titanium, exposed movement, rubber strap. Co-developed with Airbus Corporate Jets.",
  },
  // ROLEX
  {
    id: "cellini-moonphase",
    name: "Cellini Moonphase",
    aliases: ["cellini moonphase","rolex cellini moonphase"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex Cellini Moonphase ref 50535. 39mm Everose gold, round dress case with double bezel, white lacquer dial, blue enamel moonphase disc at 6 with a meteorite full moon, date around the rim, leather strap. Rolex's most romantic dress watch.",
  },
  {
    id: "datejust-36-palm",
    name: "Datejust 36 Palm",
    aliases: ["datejust 36 palm","rolex datejust 36 palm"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex Datejust 36 'Palm' ref 126234. 36mm steel with white-gold fluted bezel, olive-green dial with a tropical palm-leaf motif, date at 3 with cyclops, Jubilee or Oyster bracelet. Playful 2021 motif dial.",
  },
  {
    id: "day-date-40-platine-ice-blue",
    name: "Day-Date 40 Platinum Ice Blue",
    aliases: ["day-date 40 platinum ice blue","rolex day-date 40 platinum ice blue","rolex day date 40 platinum ice blue"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex Day-Date 40 ref 228206 in 950 platinum with ice-blue dial. 40mm platinum, smooth or fluted bezel, the platinum-exclusive ice-blue dial, day spelled at 12 and date at 3, President bracelet. The ultimate prestige Day-Date.",
  },
  {
    id: "deepsea-james-cameron",
    name: "Deepsea James Cameron",
    aliases: ["deepsea james cameron","rolex deepsea james cameron"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex Deepsea Sea-Dweller 'James Cameron' ref 126660. 44mm steel, D-blue gradient dial fading blue-to-black (Mariana Trench tribute), unidirectional black ceramic bezel, helium escape valve, Oyster bracelet. Water-resistant to 3900m.",
  },
  {
    id: "explorer-i-36",
    name: "Explorer I 36",
    aliases: ["explorer i 36","rolex explorer i 36"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex Explorer ref 124270. 36mm stainless steel, smooth bezel, matte black dial with luminous 3-6-9 Arabic numerals and baton markers, no date, Oyster bracelet. The pure tool-watch born from Everest 1953.",
  },
  {
    id: "gmt-master-ii-root-beer",
    name: "GMT-Master II Root Beer",
    aliases: ["gmt-master ii root beer","rolex gmt-master ii root beer","rolex gmt master ii root beer"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex GMT-Master II 'Root Beer' ref 126711CHNR. 40mm Everose Rolesor (steel and rose gold), brown and black ceramic bezel, black dial, rose-gold 24h hand, date at 3, Jubilee or Oyster bracelet. Warm two-tone pilot's GMT.",
  },
  {
    id: "oyster-perpetual-41-turquoise",
    name: "Oyster Perpetual 41 Turquoise",
    aliases: ["oyster perpetual 41 turquoise","rolex oyster perpetual 41 turquoise"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex Oyster Perpetual 41 ref 124300 with turquoise dial. 41mm steel, smooth polished bezel, vivid turquoise lacquer dial, no date, Oyster bracelet. The coveted candy-color OP.",
  },
  {
    id: "pearlmaster",
    name: "Pearlmaster",
    aliases: ["pearlmaster","rolex pearlmaster"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex Pearlmaster (Datejust Pearlmaster). 34-39mm 18k gold, often a gem-set diamond bezel, mother-of-pearl or pavé dial, date at 3, distinctive rounded five-piece-link Pearlmaster bracelet. Rolex's most jeweled line.",
  },
  {
    id: "sea-dweller-deepsea-d-blue",
    name: "Sea-Dweller Deepsea D-Blue",
    aliases: ["sea-dweller deepsea d-blue","rolex sea-dweller deepsea d-blue","rolex sea dweller deepsea d blue"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex Deepsea D-Blue ref 126660. 44mm steel, gradient blue-to-black 'D-blue' dial (Deepsea Challenge tribute), unidirectional black ceramic 60-minute bezel, helium escape valve at 9, Oyster bracelet. Professional saturation diver, 3900m.",
  },
  {
    id: "yacht-master-ii",
    name: "Yacht-Master II",
    aliases: ["yacht-master ii","rolex yacht-master ii","rolex yacht master ii"],
    gender: "group",
    category: "luxury_watch",
    nationality: "ch",
    visual_description:
      "Rolex Yacht-Master II ref 116680. 44mm steel, white dial, blue Cerachrom rotating bezel, prominent programmable regatta countdown chronograph (1-10 min) with red triangle and blue arc, Oyster bracelet. Large nautical regatta timer.",
  },
];

// ─── Detection helpers ──────────────────────────────────────────────────────

export function findAllCelebrities(text: string): Celebrity[] {
  const lower = text.toLowerCase();
  const found: Celebrity[] = [];
  const seen = new Set<string>();

  for (const celeb of CELEBRITY_DB) {
    if (seen.has(celeb.id)) continue;
    const names = [celeb.name.toLowerCase(), ...celeb.aliases.map((a) => a.toLowerCase())];
    if (names.some((n) => lower.includes(n))) {
      found.push(celeb);
      seen.add(celeb.id);
    }
  }
  return found;
}

export function buildCelebrityContext(celebs: Celebrity[]): string {
  if (celebs.length === 0) return "";
  const entries = celebs.map(
    (c) => `CELEBRITY VISUAL REFERENCE — ${c.name.toUpperCase()}: ${c.visual_description}`,
  );
  return entries.join(" | ") + " ";
}
