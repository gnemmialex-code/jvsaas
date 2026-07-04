-- ============================================================
-- Celebrity seed — rebuilt with accurate physical descriptions
-- Run AFTER schema.sql (table must exist).
-- Idempotent: safe to re-run.
-- ============================================================

-- Add reference_image_url column if not yet present
ALTER TABLE public.celebrities
  ADD COLUMN IF NOT EXISTS reference_image_url TEXT;

-- ============================================================
-- MAIN INSERT — 7 columns (reference_image_url via UPDATE below)
-- ============================================================
INSERT INTO public.celebrities
  (id, name, aliases, category, gender, nationality, visual_description)
VALUES

-- ── DIVERTISSEMENT / HUMOUR (FRANCE) ────────────────────────
('squeezie','Squeezie',
 ARRAY['gabriel squeezio','gabriel didal'],
 'fr_comedy','male','fr',
 'French YouTuber (music, gaming, concepts). Male, ~1.65m, slim but slightly muscular. Ash-blonde hair, blue eyes, fair skin. Youthful juvenile face. Oversized streetwear: hoodies, graphic tees, caps.'),

('michou','Michou',
 ARRAY['mickaël vendetta','mickael vendetta'],
 'fr_comedy','male','fr',
 'French vlogger (humor, dance). Male, ~1.75m, slim dynamic build. Platinum blonde hair, brown eyes, three-day stubble. Colorful relaxed style: flashy sweaters, sneakers.'),

('inoxtag','Inoxtag',
 ARRAY['inox','inoxydable'],
 'fr_comedy','male','fr',
 'French YouTuber (extreme challenges, adventure). Male, ~1.80m, athletic sporty build. Medium-length brown hair, green eyes, olive skin. Angular face. Sports or casual outdoor wear.'),

('amixem','Amixem',
 ARRAY['florian fedérico','florian federico'],
 'fr_comedy','male','fr',
 'French YouTuber (humor, gaming, vlogs). Male, ~1.78m, average build. Brown hair, hazel eyes, full thick beard. Relaxed boho-chic look: shirts, casual blazers.'),

('mcfly','McFly',
 ARRAY['mcfly carlito','bryan mahe','mcfly et carlito'],
 'fr_comedy','male','fr',
 'French comedian duo McFly & Carlito. Male, ~1.75m, normal build. Bald head, dark brown beard, brown eyes. Casual: jeans, t-shirt. Mischievous smile.'),

('carlito','Carlito',
 ARRAY['carlito mcfly','alexis patry','mcfly et carlito'],
 'fr_comedy','male','fr',
 'French comedian duo McFly & Carlito. Male, ~1.80m, slightly heavy build. Long brown hair tied back, beard, light eyes. Casual: denim jacket, bandana.'),

('mister-v','Mister V',
 ARRAY['yvick letexier','mistervofficial','mister v'],
 'fr_comedy','male','fr',
 'French comedian and actor of Cameroonian descent. Male, ~1.85m, athletic build. Mixed race, short curly black hair, brown eyes. Streetwear: baggy pants, gold chain. Discreet tattoos.'),

('seb','Seb',
 ARRAY['seb du sud','sebastien du sud','seb la frite'],
 'fr_comedy','male','fr',
 'French humor YouTuber. Male, ~1.72m, slim. Brown hair, green eyes. Chill look: shorts, t-shirt, cap. Fine face, small beard.'),

('theodort','Théodort',
 ARRAY['theodort','theo dort'],
 'fr_comedy','male','fr',
 'French hidden-camera and humor YouTuber. Male, ~1.70m, slim energetic silhouette. Brown hair, brown eyes, thick eyebrows. Young style: Adidas tracksuit, cap.'),

('just-riadh','Just Riadh',
 ARRAY['riadh','riadh belaiche','riadh belaïche'],
 'fr_comedy','male','fr',
 'French storytelling and humor creator. Male, ~1.78m, normal build. Mixed race, wavy black hair, brown eyes. Neat beard. Urban look: long coat, sneakers.'),

('sundy-jules','Sundy Jules',
 ARRAY['sundy','sundy jules'],
 'fr_lifestyle','male','fr',
 'French lifestyle and fashion male creator. ~1.82m, slim and elegant. Bleached blonde hair, blue eyes. Fashion style: fitted jacket, wide-leg trousers. Angular face, bright white smile.'),

('natoo','Natoo',
 ARRAY['natasha','natoo youtube'],
 'fr_comedy','female','fr',
 'French humor and sketch creator. Female, ~1.65m, curvy build. Brown hair, hazel eyes, long hair often tied up. Quirky colorful look. Very expressive face.'),

('cyprien','Cyprien',
 ARRAY['cyprien iov'],
 'fr_comedy','male','fr',
 'French humor YouTuber (less active). Male, ~1.70m, slim. Brown hair, brown eyes. Few-days beard, sometimes glasses. Simple: jeans, sweater.'),

('norman','Norman',
 ARRAY['norman thavaud'],
 'fr_comedy','male','fr',
 'French humor vlogger (less active). Male, ~1.65m, small build. Brown hair, brown eyes. Casual hoodie and t-shirt. Round face, goofy smile.'),

('pierre-croce','Pierre Croce',
 ARRAY['pierre croce'],
 'fr_comedy','male','fr',
 'French stand-up comedian and YouTuber. Male, ~1.75m, normal build. Brown hair, brown eyes, short beard, styled hair. Smart-casual: jacket, shirt.'),

('joyca','Joyca',
 ARRAY['joris cantin'],
 'fr_comedy','male','fr',
 'French humor, gaming and vlog creator. Male, ~1.80m, slim. Blonde hair, blue eyes. Colorful style: pink sweater, sneakers. Fine face, mischievous look.'),

('mastu','Mastu',
 ARRAY['mastuvu'],
 'fr_comedy','male','fr',
 'French humor and gaming YouTuber. Male, ~1.78m, average build. Brown hair, brown eyes, beard, glasses. Geek-chic hooded sweatshirt.'),

('lebouseuh','LeBouseuh',
 ARRAY['bouseuh','le bouseuh'],
 'fr_comedy','male','fr',
 'French humor, gaming and challenge streamer. Male, ~1.75m, sporty build. Brown hair, brown eyes. Street: cap, jogging. Round face, mocking smile.'),

('valouzz','Valouzz',
 ARRAY['valouz'],
 'fr_comedy','male','fr',
 'French humor vlogger. Male, ~1.77m, normal build. Brown hair, brown eyes. Relaxed: t-shirt, jeans. Nascent beard.'),

('pidi','Pidi',
 ARRAY['pidi streamer'],
 'fr_comedy','male','fr',
 'French gaming humor creator. Male, ~1.70m, slim. Blonde hair, blue eyes. Young: sweatshirt, beanie. Baby-faced appearance.'),

('doc-jazy','Doc Jazy',
 ARRAY['docjazy'],
 'fr_comedy','male','fr',
 'French humor and music creator. Male, ~1.75m, normal build. Brown hair, brown eyes, beard, sometimes long hair. Rock look: leather jacket.'),

('le-grand-jd','Le Grand JD',
 ARRAY['grand jd','jean dragan'],
 'fr_comedy','male','fr',
 'French comedian and chronicler. Male, ~1.80m, average build. Brown hair, brown eyes, beard. Casual-chic look.'),

('poisson-fecond','Poisson Fécond',
 ARRAY['poisson fecond'],
 'fr_comedy','male','fr',
 'French absurdist humor YouTuber. Male, ~1.70m, slim. Brown hair, brown eyes. Quirky: round glasses, vintage coat.'),

('le-rire-jaune','Le Rire Jaune',
 ARRAY['rire jaune'],
 'fr_comedy','male','fr',
 'French parody and humor YouTuber. Male, ~1.75m, normal build. Brown hair, brown eyes. Simple, cap.'),

('le-roi-des-rats','Le Roi des Rats',
 ARRAY['roi des rats','roiderats'],
 'fr_comedy','male','fr',
 'French absurd humor streamer. Male, ~1.72m, slim. Brown hair, brown eyes. Dark style: black clothing, piercing.'),

('antoine-daniel','Antoine Daniel',
 ARRAY['antoinedaniel'],
 'fr_comedy','male','fr',
 'French media critic and humor creator. Male, ~1.80m, normal build. Brown hair, brown eyes, beard. Intellectual: glasses, shirt.'),

('le-monde-a-lenvers','Le Monde à l''Envers',
 ARRAY['monde a lenvers'],
 'fr_comedy','male','fr',
 'French parody humor YouTuber. Male, ~1.78m, normal build. Brown hair, brown eyes. Relaxed casual style.'),

('maxestla','MaxEstLa',
 ARRAY['max est la'],
 'fr_comedy','male','fr',
 'French humor vlogger. Male, ~1.75m, slim. Blonde hair, blue eyes. Young casual: sweatshirt, cap.'),

('le-tatou','Le Tatou',
 ARRAY['le tatou youtube'],
 'fr_comedy','male','fr',
 'French prank and hidden-camera YouTuber. Male, ~1.70m, stocky build. Brown hair, brown eyes. Street: big sneakers.'),

-- ── LIFESTYLE / BEAUTÉ (FRANCE) ─────────────────────────────
('lena-situations','Léna Situations',
 ARRAY['lena situations','léna mahfouf','lena mahfouf'],
 'fr_lifestyle','female','fr',
 'French fashion vlogger and author. Female, ~1.58m, slim. Brown hair, brown eyes, mid-length with bangs. Modern Parisian: blazer, jeans, ankle boots. Fine face, fair skin.'),

('romy','Romy',
 ARRAY['romy influencer','romy fr'],
 'fr_beauty','female','fr',
 'French beauty and lifestyle creator. Female, ~1.65m, slim. Blonde hair, blue eyes, long wavy hair. Glamorous: fitted dress, heels. Soft face, full lips.'),

('paola-locatelli','Paola Locatelli',
 ARRAY['paola'],
 'fr_lifestyle','female','fr',
 'French mixed-race actress and lifestyle creator. Female, ~1.70m, slim. Brown curly hair, hazel eyes. Fashion structured pieces. High cheekbones, bright smile.'),

('mayadorable','Mayadorable',
 ARRAY['maya adorable','maya'],
 'fr_lifestyle','female','fr',
 'French humor and lifestyle creator. Female, ~1.60m, normal build. Brown hair, brown eyes, long hair. Natural minimal-makeup look, jeans. Round face, friendly.'),

('sananas','Sananas',
 ARRAY['sanam wae','sanam waé'],
 'fr_beauty','female','fr',
 'French beauty creator. Female, ~1.65m, slim. Brown hair, green eyes, long straight hair. Sophisticated: blazer, scarf. Fine face, fair skin.'),

('enjoy-phoenix','EnjoyPhoenix',
 ARRAY['enjoyphoenix','marie lopez'],
 'fr_beauty','female','fr',
 'French beauty, wellness and cooking creator. Female, ~1.70m, normal build. Blonde hair, blue eyes, mid-length hair. Soft pastel style: flowy dresses. Angelic face.'),

('shera-kerienski','Shera Kerienski',
 ARRAY['shera'],
 'fr_beauty','female','fr',
 'French beauty and body-positive creator. Female, ~1.68m, curvy build. Mixed race, brown curly hair, brown eyes. Assertive: fitted outfits, vivid colors. Full cheeks, wide smile.'),

('carla-ginola','Carla Ginola',
 ARRAY['carla ginola'],
 'fr_lifestyle','female','fr',
 'French fashion and luxury influencer. Female, ~1.75m, slim. Blonde hair, blue eyes, long hair. Luxury: tailored suit, designer bag. Aristocratic fine face.'),

('chloe-b','Chloé B',
 ARRAY['chloe b'],
 'fr_beauty','female','fr',
 'French skincare and beauty creator. Female, ~1.62m, slim. Brown hair, brown eyes, mid-length hair. Natural minimal-makeup, soft sweaters. Young face, flawless skin.'),

('clara-marz','Clara Marz',
 ARRAY['claramarz'],
 'fr_lifestyle','female','fr',
 'French lifestyle, music and vlog creator. Female, ~1.67m, slim. Brown wavy hair, hazel eyes. Artistic: vintage jewelry, colorful jackets. Expressive face.'),

('nabilla','Nabilla',
 ARRAY['nabilla benattia'],
 'fr_lifestyle','female','fr',
 'French glamour and reality-TV celebrity. Female, ~1.70m, slim. Brown hair, brown eyes, long straight hair. Ultra-glamorous with surgically-enhanced lips. Crop top, stiletto heels.'),

('iris-mittenaere','Iris Mittenaere',
 ARRAY['iris','miss france','miss univers 2016'],
 'fr_model','female','fr',
 'French Miss France and Miss Universe 2016. Female, ~1.63m, slim. Brown hair, brown eyes, mid-length hair. Elegant: evening dress, suit. Symmetrical face, perfect smile.'),

('camille-lv','Camille LV',
 ARRAY['camille leblanc'],
 'fr_lifestyle','female','fr',
 'French fashion and luxury influencer. Female, ~1.72m, slim. Blonde hair, blue eyes. Bourgeois-chic: trench coat, sunglasses. Fine face.'),

('juste-zoe','Juste Zoé',
 ARRAY['juste zoe'],
 'fr_lifestyle','female','fr',
 'French lifestyle and travel creator. Female, ~1.65m, normal build. Brown hair, brown eyes. Bohemian: long dresses, hat. Soft face.'),

('the-doll-beauty','The Doll Beauty',
 ARRAY['doll beauty','thedollbeauty'],
 'fr_beauty','female','fr',
 'French beauty and makeup creator. Female, ~1.60m, slim. Brown hair, brown eyes. Glamorous: false lashes, heavy contouring. Doll-like face.'),

('danae-makeup','Danae Makeup',
 ARRAY['danae','danaemakeup'],
 'fr_beauty','female','fr',
 'French professional makeup artist. Female, ~1.62m, slim. Brown hair, hazel eyes. Creative: colorful makeup, black clothing.'),

('marion-cameleon','Marion Caméléon',
 ARRAY['marion cameleon','marioncameleon'],
 'fr_beauty','female','fr',
 'French fashion and costume creator. Female, ~1.68m, normal build. Brown hair, brown eyes. Chameleon identity: constantly changes hairstyle and look. Neutral base face.'),

-- ── FITNESS / SPORT (FRANCE) ─────────────────────────────────
('tibo-inshape','Tibo InShape',
 ARRAY['tibo','thibault inshape'],
 'fr_fitness','male','fr',
 'French bodybuilding YouTuber. Male, ~1.85m, extremely muscular bodybuilder physique. Bald head, brown eyes, tanned skin. Defined pectorals, visible veins. Tank top, shorts. Often shirtless.'),

('juju-fitcats','Juju Fitcats',
 ARRAY['juju fitcats','justine quintin'],
 'fr_fitness','female','fr',
 'French fitness and nutrition creator. Female, ~1.65m, athletic with visible abs. Blonde hair, blue eyes, long hair usually tied up. Sportswear: leggings, sports bra. Pretty determined face.'),

('sissy-mua','Sissy MUA',
 ARRAY['sissy','sissymua'],
 'fr_fitness','female','fr',
 'French fitness program creator. Female, ~1.68m, athletic with well-developed glutes. Brown hair, brown eyes, long hair. Fitted sportswear. Made-up face.'),

('nassim-sahili','Nassim Sahili',
 ARRAY['nassim'],
 'fr_fitness','male','fr',
 'French bodybuilding coach. Male, ~1.78m, very muscular. Brown hair, brown eyes, beard. Street-fitness: tracksuit, cap. Visible tattoos.'),

('enzo-foukra','Enzo Foukra',
 ARRAY['enzo foukra','enzo'],
 'fr_fitness','male','fr',
 'French fitness and motivation creator. Male, ~1.80m, lean muscular. Brown hair, brown eyes. Street: baggy, tank top. Angular face.'),

('yanisport','Yanisport',
 ARRAY['yanis sport','yanis'],
 'fr_fitness','male','fr',
 'French sports coach YouTuber. Male, ~1.75m, athletic. Brown hair, brown eyes. Clean: white t-shirt, shorts. Friendly face.'),

('bodytime','Bodytime',
 ARRAY['body time'],
 'fr_fitness','duo','fr',
 'French fitness duo. Two muscular men, shaved or bearded, ~1.80m each. Classic fitness look: gloves, belt.'),

('alex-levand','Alex Levand',
 ARRAY['alexlevand'],
 'fr_fitness','male','fr',
 'French fitness and lifestyle creator. Male, ~1.83m, lean and muscular. Brown hair, brown eyes. Fit-influencer: fitted sweatshirt, smartwatch.'),

('jean-onche','Jean Onche',
 ARRAY['jeanonche'],
 'fr_comedy','male','fr',
 'French humor and bodybuilding creator. Male, ~1.75m, massive heavy build. Bearded, bald or very short hair. Quirky: humor t-shirt, jogging.'),

('thibault-geoffray','Thibault Geoffray',
 ARRAY['thibault geoffray'],
 'fr_fitness','male','fr',
 'French nutrition and fitness creator. Male, ~1.78m, naturally athletic. Brown hair, brown eyes. Healthy: fleece, sneakers. Young face.'),

('justine-gallice','Justine Gallice',
 ARRAY['justine gallice'],
 'fr_fitness','female','fr',
 'French fitness and lifestyle creator. Female, ~1.67m, athletic. Blonde hair, blue eyes, long hair. Sports look: neon leggings.'),

-- ── GAMING / STREAMING (FRANCE) ──────────────────────────────
('gotaga','Gotaga',
 ARRAY['corentin houssein'],
 'fr_gaming','male','fr',
 'French streamer and ex-professional FPS player. Male, ~1.78m, normal build. Mixed race, short black hair, brown eyes. Street: cap, sweatshirt. Light beard.'),

('domingo','Domingo',
 ARRAY['quentin domingo'],
 'fr_gaming','male','fr',
 'French gaming host and streamer. Male, ~1.75m, average build. Brown hair, brown eyes, glasses. Casual: shirt, jeans. Smiling friendly face.'),

('kameto','Kameto',
 ARRAY['kévin diagne','kevin diagne'],
 'fr_gaming','male','fr',
 'French streamer and KCorp CEO. Male, ~1.80m, stocky but muscular. Dark black hair, heavy beard, brown eyes. KCorp branded tracksuit. Broad strong face.'),

('zerator','Zerator',
 ARRAY['antoine bournier'],
 'fr_gaming','male','fr',
 'French gaming event organizer and streamer. Male, ~1.78m, normal build. Brown hair, beard, brown eyes. Simple: t-shirt, cap. Thick prominent eyebrows.'),

('ponce','Ponce',
 ARRAY['anthony hazael-massieux','anthoponce'],
 'fr_gaming','male','fr',
 'French chill streamer. Male, ~1.72m, slim. Brown hair, mustache, brown eyes. Relaxed: wide loose sweater.'),

('maghla','Maghla',
 ARRAY['margaux streamer'],
 'fr_gaming','female','fr',
 'French gaming streamer. Female, ~1.65m, slim. Brown hair, brown eyes, long hair. Subtle gothic style: black clothing, silver jewelry. Pale complexion.'),

('ultia','Ultia',
 ARRAY['mathilde galoyer'],
 'fr_gaming','female','fr',
 'French gaming streamer. Female, ~1.62m, slim. Blonde hair, blue eyes, long hair. Pastel kawaii look: pink and unicorn aesthetic. Doll-like face.'),

('chowh1','Chowh1',
 ARRAY['chow'],
 'fr_gaming','male','fr',
 'French FPS streamer. Male, ~1.80m, sporty build. Brown hair, brown eyes. Street: cap, jogging.'),

('mistermv','MisterMV',
 ARRAY['martin victor','mister mv'],
 'fr_gaming','male','fr',
 'French variety streamer. Male, ~1.75m, normal build. Bearded, glasses. Geek: retro gaming t-shirt.'),

('etoiles','Etoiles',
 ARRAY['alexandre danois','étoiles'],
 'fr_gaming','male','fr',
 'French variety streamer. Male, ~1.78m, young build. Brown hair, brown eyes. Simple: sweatshirt, jeans. Fine face.'),

('locklear','Locklear',
 ARRAY['locklear streamer'],
 'fr_gaming','male','fr',
 'French streamer. Male, ~1.80m, normal build. Brown hair, brown eyes. Casual everyday look.'),

('jl-tomy','JL Tomy',
 ARRAY['tomy jl','jl crew tomy'],
 'fr_gaming','male','fr',
 'French streamer (JL family). Male, ~1.70m, slim. Brown hair, glasses. Relaxed casual.'),

('jl-amine','JL Amine',
 ARRAY['amine jl','jl crew amine'],
 'fr_gaming','male','fr',
 'French streamer (JL family). Male, ~1.75m, normal build. Brown hair, brown eyes.'),

('jl-bichou','JL Bichou',
 ARRAY['bichou jl','jl crew bichou'],
 'fr_gaming','male','fr',
 'French streamer (JL family). Male, ~1.72m, slightly stocky. Brown hair.'),

('terracid','Terracid',
 ARRAY['terracid wankil','wankil studio terracid'],
 'fr_gaming','male','fr',
 'French humor streamer (Wankil Studio duo). Male, ~1.78m, normal build. Brown hair, brown eyes. Simple casual look.'),

('laink','Laink',
 ARRAY['laink wankil','wankil studio laink'],
 'fr_gaming','male','fr',
 'French humor streamer (Wankil Studio duo). Male, ~1.80m, slim. Brown hair, brown eyes. Simple casual look.'),

('vodk','VodK',
 ARRAY['vodk streamer'],
 'fr_gaming','male','fr',
 'French streamer. Male, ~1.77m, normal build. Brown hair, brown eyes. Casual gaming style.'),

('sora','Sora',
 ARRAY['sora streamer','sora fr'],
 'fr_gaming','male','fr',
 'French streamer. Male, mid-20s. Dark hair. Casual gaming style.'),

('ad-laurent','AD Laurent',
 ARRAY['ad laurent','adlaurent'],
 'fr_gaming','male','fr',
 'French streamer and adult content creator. Male, ~1.85m, muscular, numerous tattoos on arms and chest. Brown eyes, beard. Bad-boy: gold chain, leather jacket.'),

('gatooz','Gatooz',
 ARRAY['gatoo z'],
 'fr_gaming','male','fr',
 'French streamer. Male, ~1.82m, muscular, full beard, brown eyes. Virile build. Street: sweatshirt, jogging.'),

-- ── ÉDUCATION / VULGARISATION (FRANCE) ──────────────────────
('hugodecrypte','HugoDécrypte',
 ARRAY['hugo decrypte','hugo décrypte','hugo travers'],
 'fr_education','male','fr',
 'French journalist and news YouTuber. Male, ~1.80m, slim. Brown hair, brown eyes, neatly styled. Casual-chic: shirt, jeans. Serious composed face.'),

('nota-bene','Nota Bene',
 ARRAY['notabene','benjamin brillaud'],
 'fr_education','male','fr',
 'French history YouTuber. Male, ~1.75m, normal build. Brown hair, brown eyes, beard. Intellectual: roll-neck sweater, sometimes glasses.'),

('dr-nozman','Dr Nozman',
 ARRAY['nozman','nicolas beudin'],
 'fr_education','male','fr',
 'French science YouTuber. Male, ~1.78m, normal build. Brown hair, brown eyes, beard. Relaxed geek: science t-shirt.'),

('dirty-biology','DirtyBiology',
 ARRAY['dirty biology','léo bernard','leo bernard'],
 'fr_education','male','fr',
 'French biology YouTuber with humor. Male, ~1.80m, slim, long hair. Brown hair, brown eyes. Hipster: full beard, flannel check shirt.'),

('cyrus-north','Cyrus North',
 ARRAY['cyrusnorth'],
 'fr_education','male','fr',
 'French philosophy and debate YouTuber. Male, ~1.75m, normal build. Brown hair, brown eyes, beard. Simple casual look.'),

('gaspard-g','Gaspard G',
 ARRAY['gaspard'],
 'fr_education','male','fr',
 'French politics and economics YouTuber. Male, ~1.82m, slim. Brown hair, brown eyes. BCBG: tailored suit or blazer.'),

('science-etonnante','ScienceEtonnante',
 ARRAY['science etonnante','david louapre'],
 'fr_education','male','fr',
 'French physics YouTuber. Male, ~1.70m, normal build. Brown hair, brown eyes, glasses. Professor look.'),

('monsieur-phi','Monsieur Phi',
 ARRAY['monsieurphi'],
 'fr_education','male','fr',
 'French philosophy YouTuber. Male, ~1.78m, normal build. Brown hair, brown eyes, beard. University intellectual look.'),

('linguisticae','Linguisticae',
 ARRAY['rémi fonteneau','remi fonteneau'],
 'fr_education','male','fr',
 'French linguistics YouTuber. Male, ~1.75m, normal build. Brown hair, brown eyes. Casual everyday look.'),

('charles-villa','Charles Villa',
 ARRAY['charlesvilla'],
 'fr_education','male','fr',
 'French geography and history YouTuber. Male, ~1.80m, slim. Brown hair, brown eyes. Modern casual look.'),

('doc-seven','Doc Seven',
 ARRAY['doc 7'],
 'fr_education','male','fr',
 'French medical content creator. Male, ~1.75m. Casual semi-professional look.'),

-- ── +18 / GLAMOUR / CONTENU ADULTE — SFW OUTPUT ONLY ────────
('mymi-rose','Mymi Rose',
 ARRAY['mymi'],
 'fr_lifestyle','female','fr',
 'French content creator (SFW). Female, ~1.62m, generous curvy figure (large chest, wide hips). Brown hair, brown eyes, long hair. Glamorous look. (SFW output only.)'),

('eva-elfie-fr','Eva Elfie FR',
 ARRAY['eva elfie france'],
 'fr_lifestyle','female','fr',
 'French content creator (SFW). Female, ~1.63m, slim. Blonde hair, blue eyes, long hair. Girl-next-door: light dress. Juvenile face. (SFW output only.)'),

('lila-taleb','Lila Taleb',
 ARRAY['lila taleb'],
 'fr_lifestyle','female','fr',
 'French content creator (SFW). Female, ~1.65m, athletic. Brown hair, brown eyes. Fitted outfits. (SFW output only.)'),

('cassandra-calogera','Cassandra Calogera',
 ARRAY['cassandra'],
 'fr_lifestyle','female','fr',
 'French content creator (SFW). Female, ~1.68m, curvy. Brown hair, hazel eyes, long hair. Glamorous. (SFW output only.)'),

('lea-mary','Léa Mary',
 ARRAY['lea mary','léa'],
 'fr_lifestyle','female','fr',
 'French content creator (SFW). Female, ~1.67m, slim. Blonde hair, blue eyes. Natural look. (SFW output only.)'),

('astrid-nelsia','Astrid Nelsia',
 ARRAY['astrid'],
 'fr_lifestyle','female','fr',
 'French content creator (SFW). Female, ~1.70m, athletic. Mixed race, curly natural hair. Exotic style. (SFW output only.)'),

('marine-el-himer','Marine El Himer',
 ARRAY['marine elhimer'],
 'fr_lifestyle','female','fr',
 'French content creator (SFW). Female, ~1.65m, slim. Brown hair, brown eyes. Glamorous look. (SFW output only.)'),

('oceane-el-himer','Océane El Himer',
 ARRAY['oceane el himer'],
 'fr_lifestyle','female','fr',
 'French content creator (SFW). Female, ~1.64m, slim. Brown hair, brown eyes. Near-identical twin of Marine El Himer. (SFW output only.)'),

('melanie-orl','Mélanie Orl',
 ARRAY['melanie orl'],
 'fr_lifestyle','female','fr',
 'French content creator (SFW). Female, ~1.68m, curvy. Brown hair, green eyes. (SFW output only.)'),

('maeva-ghennam','Maeva Ghennam',
 ARRAY['maeva'],
 'fr_lifestyle','female','fr',
 'French glamour influencer. Female, ~1.70m, generous curves (notable chest and hips). Brown hair, brown eyes. Very glamorous: crop top, leggings. (SFW output only.)'),

('sarah-fraisou','Sarah Fraisou',
 ARRAY['sarah fraisou'],
 'fr_lifestyle','female','fr',
 'French content creator (SFW). Female, ~1.65m, full-figured. Brown hair, brown eyes. Body-positive look. (SFW output only.)'),

('laura-lempika','Laura Lempika',
 ARRAY['laura lempika'],
 'fr_lifestyle','female','fr',
 'French content creator (SFW). Female, ~1.72m, slim. Brown hair, brown eyes. Glamorous. (SFW output only.)'),

('manon-tanti','Manon Tanti',
 ARRAY['manon tanti'],
 'fr_lifestyle','female','fr',
 'French content creator (SFW). Female, ~1.63m, normal build. Brown hair, brown eyes. (SFW output only.)'),

('carla-moreau','Carla Moreau',
 ARRAY['carla moreau'],
 'fr_lifestyle','female','fr',
 'French content creator (SFW). Female, ~1.60m, short and slim. Brown hair, brown eyes. (SFW output only.)'),

('shanna-kress','Shanna Kress',
 ARRAY['shanna'],
 'fr_lifestyle','female','fr',
 'French content creator (SFW). Female, ~1.70m, athletic. Brown hair, green eyes. (SFW output only.)'),

('kim-glow','Kim Glow',
 ARRAY['kimglow'],
 'fr_lifestyle','female','fr',
 'French content creator (SFW). Female, ~1.68m, slim. Blonde hair, blue eyes. Glowing glittery makeup style. (SFW output only.)'),

('gaelle-garcia-diaz','Gaëlle Garcia Diaz',
 ARRAY['gaelle garcia diaz','gaelle garcia'],
 'fr_lifestyle','female','fr',
 'French glamour influencer. Female, ~1.72m, sculpted body (abs, prominent glutes). Long brown hair. Luxury look. (SFW output only.)'),

('amouranth','Amouranth',
 ARRAY['kaitlyn siragusa'],
 'int_adult','female','us',
 'American streamer and content creator (SFW only). Female, ~1.65m, very generous curves. Signature long red hair, green eyes. Kawaii or glamour style. (SFW output only.)'),

('belle-delphine','Belle Delphine',
 ARRAY['belle delphine'],
 'int_adult','female','uk',
 'British content creator (SFW only). Female, ~1.62m, slim. Signature pink hair, blue eyes. Kawaii: fairy ears, heavy doll-like makeup. (SFW output only.)'),

('corinna-kopf','Corinna Kopf',
 ARRAY['corinna kopf','corinna'],
 'int_adult','female','us',
 'American content creator (SFW). Female, ~1.70m, slim slender. Blonde hair, blue eyes. Californian casual look. (SFW output only.)'),

('jem-wolfie','Jem Wolfie',
 ARRAY['jem wolfie'],
 'int_adult','female','au',
 'Australian fitness content creator (SFW). Female, ~1.68m, athletic with prominent glutes. Brown hair, brown eyes. Sportswear. (SFW output only.)'),

('violet-myers','Violet Myers',
 ARRAY['violet myers'],
 'int_adult','female','us',
 'American content creator (SFW). Female, ~1.60m, generous curves. Brown hair, brown eyes. Latina style. (SFW output only.)'),

('emily-black','Emily Black',
 ARRAY['emily black'],
 'int_adult','female','uk',
 'British content creator (SFW). Female, ~1.65m, slim. Brown hair, brown eyes. Girl-next-door look. (SFW output only.)'),

('lauren-alexis','Lauren Alexis',
 ARRAY['lauren alexis'],
 'int_adult','female','uk',
 'British content creator (SFW). Female, ~1.67m, slim. Brown hair, brown eyes. British glam look. (SFW output only.)'),

('lena-the-plug','Lena The Plug',
 ARRAY['lena plug','lena the plug'],
 'int_adult','female','us',
 'American content creator (SFW). Female, ~1.70m, athletic, tattoos. Brown hair, brown eyes. Spicy fitness look. (SFW output only.)'),

('sky-bri','Sky Bri',
 ARRAY['sky bri','skybri'],
 'int_adult','female','us',
 'American content creator (SFW). Female, ~1.73m, slim. Blonde hair, blue eyes, long hair. Californian beach style. (SFW output only.)'),

('karina-pedro','Karina Pedro',
 ARRAY['karina pedro'],
 'int_adult','female','us',
 'American content creator (SFW). Female, ~1.62m, generous curves. Brown hair, brown eyes. Latina style. (SFW output only.)'),

('ana-cheri','Ana Cheri',
 ARRAY['ana cheri'],
 'int_adult','female','us',
 'American fitness model and content creator (SFW). Female, ~1.68m, very athletic (abs, prominent glutes). Brown hair, green eyes. Sport-chic. (SFW output only.)'),

('sommer-ray','Sommer Ray',
 ARRAY['sommer ray','sommer'],
 'int_adult','female','us',
 'American glamour fitness influencer (SFW). Female, ~1.73m, athletic, celebrated glutes. Brown hair, brown eyes. Fitness lifestyle look. (SFW output only.)'),

('abby-rao','Abby Rao',
 ARRAY['abby rao'],
 'int_adult','female','us',
 'American content creator (SFW). Female, ~1.65m, slim, tattoos. Brown hair, brown eyes. Alternative look. (SFW output only.)'),

('katie-sigmond','Katie Sigmond',
 ARRAY['katie sigmond'],
 'int_adult','female','us',
 'American content creator (SFW). Female, ~1.68m, athletic. Brown hair, brown eyes. Glamorous golfer aesthetic. (SFW output only.)'),

('hannah-owo','Hannah Owo',
 ARRAY['hannah owo'],
 'int_adult','female','us',
 'American content creator (SFW). Female, ~1.62m, slim. Brown hair, brown eyes. E-girl style. (SFW output only.)'),

('sarati','Sarati',
 ARRAY['sarati'],
 'int_adult','female','us',
 'American content creator (SFW). Female, ~1.67m, normal build. Brown hair, brown eyes. (SFW output only.)'),

('kinsey-wolanski','Kinsey Wolanski',
 ARRAY['kinsey wolanski'],
 'int_adult','female','us',
 'American model and content creator (SFW). Female, ~1.70m, slim. Blonde hair, blue eyes. Model look. (SFW output only.)'),

('jack-doherty','Jack Doherty',
 ARRAY['jack doherty'],
 'int_adult','male','us',
 'American YouTuber. Male, ~1.75m, slim, young. Brown hair, brown eyes. Casual American look.'),

('jason-luv','Jason Luv',
 ARRAY['jason luv'],
 'int_adult','male','us',
 'American content creator (SFW). Male, ~1.88m, very muscular, numerous tattoos. Beard. Bodybuilder street look. (SFW output only.)'),

('bryce-hall','Bryce Hall',
 ARRAY['bryce hall'],
 'int_adult','male','us',
 'American TikToker (SFW). Male, ~1.83m, slim, tattoos. Brown hair, brown eyes. TikTok influencer look. (SFW output only.)'),

('harry-jowsey','Harry Jowsey',
 ARRAY['harry jowsey'],
 'int_adult','male','au',
 'Australian Too Hot To Handle star (SFW). Male, ~1.90m, muscular. Brown hair, brown eyes, tattoos. Playboy Australian look. (SFW output only.)'),

-- ── INTERNATIONAUX — YOUTUBE / TIKTOK ───────────────────────
('mrbeast','MrBeast',
 ARRAY['mr beast','jimmy donaldson'],
 'int_youtube','male','us',
 'American philanthropist YouTuber (Jimmy Donaldson). Male, ~1.88m, tall slim. Medium-long brown hair, brown eyes, angular face. Wide forced smile. Casual: t-shirt, jeans.'),

('pewdiepie','PewDiePie',
 ARRAY['pewdiepie','felix kjellberg'],
 'int_youtube','male','se',
 'Swedish gaming and humor YouTuber (Felix Kjellberg). Male, ~1.80m, slim. Brown hair, blue eyes, several-day beard. Casual Scandinavian: sweatshirt, jogging.'),

('charli-damelio','Charli D''Amelio',
 ARRAY['charli damelio','charli'],
 'int_tiktok','female','us',
 'American TikTok dance creator. Female, ~1.70m, slim. Brown hair, brown eyes, long hair. Teenage look: leggings, crop top. Pretty neutral face.'),

('khaby-lame','Khaby Lame',
 ARRAY['khaby lame','khaby'],
 'int_tiktok','male','it',
 'Senegalese-Italian silent-humor TikTok creator. Male, ~1.85m, slim. Black, brown eyes, clean-shaved head. Simple iconic: white t-shirt, jeans. Very expressive deadpan face.'),

('addison-rae','Addison Rae',
 ARRAY['addison rae','addison'],
 'int_tiktok','female','us',
 'American TikTok dance and music creator. Female, ~1.68m, slim. Brown hair, brown eyes, long hair. American glamour: short dress, heels.'),

('logan-paul','Logan Paul',
 ARRAY['logan paul','logan'],
 'int_youtube','male','us',
 'American YouTuber and boxer. Male, ~1.83m, muscular with tattoos. Brown hair, brown eyes. Show-biz: flashy tracksuit, gold chain.'),

('jake-paul','Jake Paul',
 ARRAY['jake paul','jake'],
 'int_youtube','male','us',
 'American boxer and YouTuber. Male, ~1.85m, muscular with tattoos. Brown hair, brown eyes. Baggy streetwear.'),

('ksi','KSI',
 ARRAY['jj olatunji','jj'],
 'int_youtube','male','uk',
 'British-Nigerian YouTuber and rapper (JJ Olatunji). Male, ~1.83m, stocky but muscular. Black, brown eyes. Streetwear: bandana, oversize sweatshirt.'),

('emma-chamberlain','Emma Chamberlain',
 ARRAY['emma chamberlain','emma'],
 'int_youtube','female','us',
 'American vlogger. Female, ~1.68m, slim. Brown hair, brown eyes, mid-length. Vintage look: wide trousers, small cropped tops. Stylishly tired face.'),

('bella-poarch','Bella Poarch',
 ARRAY['bella poarch','bella'],
 'int_tiktok','female','us',
 'Filipino-American TikTok creator. Female, ~1.60m, petite, tattoos. Filipino features, brown eyes. E-girl: colorful style, tights.'),

('zach-king','Zach King',
 ARRAY['zach king'],
 'int_tiktok','male','us',
 'American digital illusionist and TikToker. Male, ~1.75m, normal. Brown hair, brown eyes. Casual: shirt, jeans.'),

('brent-rivera','Brent Rivera',
 ARRAY['brent rivera'],
 'int_tiktok','male','us',
 'American vlogger and TikToker. Male, ~1.80m, muscular, light beard. Brown hair, brown eyes. Californian: white t-shirt.'),

('lele-pons','Lele Pons',
 ARRAY['lele pons'],
 'int_tiktok','female','us',
 'Venezuelan-American creator. Female, ~1.68m, slim, tattoos. Brown hair, brown eyes. Latina glam look.'),

('markiplier','Markiplier',
 ARRAY['mark fischbach'],
 'int_youtube','male','us',
 'American gaming YouTuber (Mark Fischbach). Male, ~1.78m, normal build. Brown hair, brown eyes, beard. Casual hooded sweatshirt.'),

('ninja','Ninja',
 ARRAY['tyler blevins'],
 'int_gaming','male','us',
 'American Fortnite streamer (Tyler Blevins). Male, ~1.80m, slim. Blonde hair often dyed vibrant colors (signature blue), blue eyes. Street casual look.'),

('pokimane','Pokimane',
 ARRAY['imane anys','poki'],
 'int_gaming','female','ca',
 'Moroccan-Canadian streamer (Imane Anys). Female, ~1.62m, slim. Brown long hair, brown eyes, North African features. Cute casual: pink sweater.'),

('kai-cenat','Kai Cenat',
 ARRAY['kai cenat'],
 'int_gaming','male','us',
 'American streamer. Male, ~1.78m, normal build. Black, brown eyes, shaved head. Streetwear: big sneakers, cap. Very energetic expressive face.'),

('ishowspeed','IShowSpeed',
 ARRAY['speed','darren watkins'],
 'int_gaming','male','us',
 'American gaming streamer (Darren Watkins Jr.). Male, ~1.78m, slim. Black, brown eyes, braided hair. Flashy tracksuit. Extremely energetic.'),

('dream','Dream',
 ARRAY['clay dream','dreamwastaken'],
 'int_gaming','male','us',
 'American gaming YouTuber. Male, ~1.87m, tall slim. Light brown hair, light skin. Wears white smiley-face mask in older content. Now shows face openly.'),

('mkbhd','MKBHD',
 ARRAY['marques brownlee','marques'],
 'int_youtube','male','us',
 'American tech YouTuber Marques Brownlee. Male, ~1.85m, slim. Black, brown eyes, clean-shaved. Smart-casual: polo shirt, quality sneakers.'),

('casey-neistat','Casey Neistat',
 ARRAY['casey neistat'],
 'int_youtube','male','us',
 'American filmmaker and vlogger. Male, ~1.78m, normal build. Blonde hair, blue eyes, beard. New York style: always wears sunglasses, motorcycle jacket.'),

('david-dobrik','David Dobrik',
 ARRAY['david dobrik'],
 'int_youtube','male','us',
 'Slovak-American vlogger. Male, ~1.75m, slim. Brown hair, brown eyes. Young casual: sweatshirt, jeans.'),

('ryan-trahan','Ryan Trahan',
 ARRAY['ryan trahan'],
 'int_youtube','male','us',
 'American challenge YouTuber. Male, ~1.78m, slim, young. Brown hair, brown eyes. Casual everyday.'),

('airrack','Airrack',
 ARRAY['airrack'],
 'int_youtube','male','us',
 'American stunt YouTuber. Male, ~1.80m, normal. Brown hair, brown eyes. Casual American.'),

('dhar-mann','Dhar Mann',
 ARRAY['dharr mann'],
 'int_youtube','male','us',
 'Indian-American moral video creator. Male, ~1.75m, normal. Brown hair, brown eyes, beard. Business-casual.'),

('dude-perfect','Dude Perfect',
 ARRAY['dude perfect'],
 'int_youtube','group','us',
 'American trick-shot stunt team (5 men). Five tall athletic American men, sporty styles.'),

('sidemen','Sidemen',
 ARRAY['sidemen group'],
 'int_youtube','group','uk',
 'British YouTube group of 7. Includes KSI (dark skin), various physiques. Young British men, streetwear UK style.'),

('veritasium','Veritasium',
 ARRAY['derek muller'],
 'int_youtube','male','ca',
 'Australian-Canadian science YouTuber (Derek Muller). Male, ~1.83m, slim. Blonde hair, blue eyes. Simple casual.'),

('smarter-every-day','SmarterEveryDay',
 ARRAY['smarter every day','destin sandlin'],
 'int_youtube','male','us',
 'American science YouTuber (Destin Sandlin). Male, ~1.78m, normal. Brown hair, brown eyes, beard. Engineer look.'),

('linus-tech-tips','Linus Tech Tips',
 ARRAY['linus','ltt','linus sebastian'],
 'int_youtube','male','ca',
 'Canadian tech YouTuber (Linus Sebastian). Male, ~1.78m, normal. Brown hair, brown eyes, beard. Geek casual.'),

('the-try-guys','The Try Guys',
 ARRAY['try guys'],
 'int_youtube','group','us',
 'American YouTube test group (4 diverse men). Diverse physiques: Eugene Lee Yang (Korean-American), Keith Habersberger (tall), Zach Kornfeld (shorter), and Ned Fulmer (former member).'),

-- ── INTERNATIONAUX — BEAUTÉ / MODE / ICÔNES ─────────────────
('huda-kattan','Huda Kattan',
 ARRAY['huda beauty','huda kattan'],
 'int_beauty','female','us',
 'Iraqi-American beauty mogul. Female, ~1.65m, slim. Long brown hair, brown eyes. Luxury glamorous: blazer, heels. Middle Eastern features.'),

('kim-kardashian','Kim Kardashian',
 ARRAY['kim k','kim kardashian west'],
 'int_celebrity','female','us',
 'American media personality. Female, ~1.59m, iconic hourglass (strong hips, narrow waist). Brown hair, brown eyes. Hyper-glamorous luxury look.'),

('kylie-jenner','Kylie Jenner',
 ARRAY['kylie jenner','kylie'],
 'int_celebrity','female','us',
 'American beauty mogul. Female, ~1.68m, generous curves, surgically augmented full lips. Brown hair, brown eyes. Luxury streetwear.'),

('kendall-jenner','Kendall Jenner',
 ARRAY['kendall jenner','kendall'],
 'int_celebrity','female','us',
 'American supermodel. Female, ~1.79m, very slim and long. Brown hair, brown eyes. Top-model look: runway style or casual chic.'),

('hailey-bieber','Hailey Bieber',
 ARRAY['hailey baldwin','hailey bieber'],
 'int_celebrity','female','us',
 'American model. Female, ~1.71m, slim. Brown hair, brown eyes. Model streetwear style.'),

('selena-gomez','Selena Gomez',
 ARRAY['selena gomez','selena'],
 'int_celebrity','female','us',
 'American singer and actress. Female, ~1.65m, normal build. Brown hair, brown eyes, round face. Elegant yet relaxed look.'),

('beyonce','Beyoncé',
 ARRAY['beyonce','queen bey'],
 'int_celebrity','female','us',
 'American global superstar. Female, ~1.69m, athletic with strong curves. Black, brown eyes. Stage: sequins, power suits. Warm brown skin, often long blonde extensions.'),

('nikkie-tutorials','NikkieTutorials',
 ARRAY['nikkie de jager','nikkie tutorials'],
 'int_beauty','female','nl',
 'Dutch beauty YouTuber Nikkie de Jager. Female, ~1.88m, very tall, blonde hair, blue eyes, transgender woman. Always dramatically glam: sequins, heels, bold makeup.'),

('james-charles','James Charles',
 ARRAY['james charles'],
 'int_beauty','male','us',
 'American beauty YouTuber. Male, ~1.70m, slim. Brown hair, brown eyes. Androgynous. Signature bold flashy artistic makeup.'),

('bretman-rock','Bretman Rock',
 ARRAY['bretman rock'],
 'int_beauty','male','us',
 'Filipino-American beauty influencer. Male, ~1.70m, normal build. Filipino features, brown eyes, tattoos. Eccentric extravagant look.'),

('chiara-ferragni','Chiara Ferragni',
 ARRAY['chiara ferragni'],
 'int_beauty','female','it',
 'Italian fashion influencer. Female, ~1.77m, slim. Blonde hair, blue eyes. Italian luxury high-fashion.'),

('dixie-damelio','Dixie D''Amelio',
 ARRAY['dixie damelio','dixie'],
 'int_tiktok','female','us',
 'American TikToker and singer, sister of Charli. Female, ~1.68m, slim. Brown hair, brown eyes. Casual American style.'),

('michelle-phan','Michelle Phan',
 ARRAY['michelle phan'],
 'int_beauty','female','us',
 'Vietnamese-American beauty YouTuber. Female, ~1.57m, slim. Dark black hair, dark eyes. Light East Asian fair skin. Elegant beauty style.'),

('lilly-singh','Lilly Singh',
 ARRAY['iisuperwomanii','superwoman'],
 'int_youtube','female','ca',
 'Canadian-Indian YouTuber. Female, ~1.67m, athletic slim. Long dark hair, brown eyes. Warm brown skin (Punjabi-Indian). Bold colorful style.'),

-- ── INTERNATIONAUX — ATHLÈTES ────────────────────────────────
('cristiano-ronaldo','Cristiano Ronaldo',
 ARRAY['ronaldo','cr7'],
 'int_athlete','male','pt',
 'Portuguese soccer superstar. Male, ~1.87m, extremely lean and muscular. Brown hair, brown eyes, chiseled sharp jaw. Often wears sharp fade haircut. Sporty-chic or tailored suit. Very defined muscular body.'),

('lionel-messi','Lionel Messi',
 ARRAY['messi','leo messi'],
 'int_athlete','male','ar',
 'Argentine soccer legend. Male, ~1.70m, short and stocky. Brown hair and beard, brown eyes. Olive/medium skin. Simple look: t-shirt, jeans. Very recognizable dark beard.'),

('neymar','Neymar',
 ARRAY['neymar jr'],
 'int_athlete','male','br',
 'Brazilian soccer star Neymar Jr. Male, ~1.75m, slim with tattoos. Brown hair (often unique styles: mohawk, braids, bleached). Brown eyes. Fashion-forward: cap, jewelry.'),

('drake','Drake',
 ARRAY['aubrey graham','champagnepapi'],
 'int_celebrity','male','ca',
 'Canadian rapper Drake (Aubrey Graham). Male, ~1.82m, normal build. Mixed race, brown eyes, beard. Luxury streetwear: Canada Goose, Nike. Fade haircut.'),

-- ── INTERNATIONAUX — GAMING / STREAMING ─────────────────────
('shroud','Shroud',
 ARRAY['michael grzesiek'],
 'int_gaming','male','ca',
 'Polish-Canadian FPS streamer. Male, ~1.83m, normal. Brown hair, brown eyes, beard. Casual everyday.'),

('tfue','Tfue',
 ARRAY['turner tenney'],
 'int_gaming','male','us',
 'American Fortnite streamer. Male, ~1.78m, slim, tattoos. Blonde hair, blue eyes. Street casual.'),

('timthetatman','TimTheTatman',
 ARRAY['tim thetatman'],
 'int_gaming','male','us',
 'American streamer. Male, ~1.90m, large heavyset build, beard, glasses. Casual everyday.'),

('valkyrae','Valkyrae',
 ARRAY['rachell hofstetter'],
 'int_gaming','female','us',
 'Filipino-American streamer. Female, ~1.63m, slim. Black hair, brown eyes. E-girl look.'),

('sykkuno','Sykkuno',
 ARRAY['thomas lu'],
 'int_gaming','male','us',
 'Asian-American streamer. Male, ~1.70m, very slim. Black hair, brown eyes. Shy cute style.'),

('xqc','xQc',
 ARRAY['felix lengyel','xqcow'],
 'int_gaming','male','ca',
 'French-Canadian streamer. Male, ~1.88m, normal. Brown hair, brown eyes, beard. Very casual.'),

('dr-disrespect','Dr Disrespect',
 ARRAY['dr disrespect'],
 'int_gaming','male','us',
 'American streamer persona. Male, ~1.96m, very tall. Signature: large black mullet wig, thick black mustache, dark wraparound sunglasses, camo or black tactical jacket. The champion persona.'),

('ludwig','Ludwig',
 ARRAY['ludwig ahgren'],
 'int_gaming','male','us',
 'American streamer (Ludwig Ahgren). Male, ~1.85m, slim. Brown hair, brown eyes, beard. Casual cozy.'),

('asmongold','Asmongold',
 ARRAY['zack asmongold'],
 'int_gaming','male','us',
 'American WoW streamer. Male, ~1.75m, normal. Brown hair (sometimes unkempt medium-length), brown eyes. Minimal geek casual.')

ON CONFLICT (id) DO UPDATE SET
  name               = EXCLUDED.name,
  aliases            = EXCLUDED.aliases,
  category           = EXCLUDED.category,
  gender             = EXCLUDED.gender,
  nationality        = EXCLUDED.nationality,
  visual_description = EXCLUDED.visual_description;

-- ============================================================
-- Set reference_image_url for celebrities with known stable photos
-- ============================================================
UPDATE public.celebrities SET reference_image_url =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cristiano_Ronaldo_2018.jpg/440px-Cristiano_Ronaldo_2018.jpg'
WHERE id = 'cristiano-ronaldo';

UPDATE public.celebrities SET reference_image_url =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Messi_vs_Nigeria_2018.jpg/440px-Messi_vs_Nigeria_2018.jpg'
WHERE id = 'lionel-messi';

UPDATE public.celebrities SET reference_image_url =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Neymar_vs_Croatia_%28cropped%29.jpg/440px-Neymar_vs_Croatia_%28cropped%29.jpg'
WHERE id = 'neymar';
