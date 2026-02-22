-- =============================================================================
-- TCG Trade Hub - Seed Data
-- Card shops in Melbourne, Australia + full fake data for development
-- =============================================================================

-- =============================================================================
-- SHOPS
-- =============================================================================

INSERT INTO public.shops (name, address, location, hours, website, phone, supported_tcgs, verified)
VALUES
  (
    'Good Games Melbourne',
    '325 Lonsdale St, Melbourne VIC 3000',
    ST_SetSRID(ST_MakePoint(144.9612, -37.8118), 4326),
    '{"monday": "10:00-21:00", "tuesday": "10:00-21:00", "wednesday": "10:00-21:00", "thursday": "10:00-21:00", "friday": "10:00-21:00", "saturday": "10:00-18:00", "sunday": "11:00-17:00"}'::jsonb,
    'https://www.goodgames.com.au',
    '+61 3 9670 8637',
    ARRAY['pokemon', 'mtg', 'yugioh']::public.tcg_type[],
    true
  ),
  (
    'Dungeon of Magic',
    '460 Elizabeth St, Melbourne VIC 3000',
    ST_SetSRID(ST_MakePoint(144.9607, -37.8098), 4326),
    '{"monday": "10:00-18:00", "tuesday": "10:00-18:00", "wednesday": "10:00-18:00", "thursday": "10:00-21:00", "friday": "10:00-21:00", "saturday": "10:00-18:00", "sunday": "11:00-17:00"}'::jsonb,
    'https://www.dungeonofmagic.com.au',
    '+61 3 9602 1407',
    ARRAY['mtg', 'yugioh']::public.tcg_type[],
    true
  ),
  (
    'Games Laboratory',
    '379 Little Lonsdale St, Melbourne VIC 3000',
    ST_SetSRID(ST_MakePoint(144.9598, -37.8108), 4326),
    '{"monday": "10:00-20:00", "tuesday": "10:00-20:00", "wednesday": "10:00-20:00", "thursday": "10:00-21:00", "friday": "10:00-21:00", "saturday": "10:00-18:00", "sunday": "11:00-17:00"}'::jsonb,
    'https://www.gameslaboratory.com.au',
    '+61 3 9328 1219',
    ARRAY['pokemon', 'mtg', 'yugioh']::public.tcg_type[],
    true
  ),
  (
    'Cherry Collectables',
    'Shop 2, 271-281 Gouger St, Melbourne VIC 3000',
    ST_SetSRID(ST_MakePoint(144.9589, -37.8202), 4326),
    '{"monday": "09:00-17:00", "tuesday": "09:00-17:00", "wednesday": "09:00-17:00", "thursday": "09:00-17:00", "friday": "09:00-17:00", "saturday": "10:00-16:00", "sunday": "closed"}'::jsonb,
    'https://www.cherrycollectables.com.au',
    '+61 3 9077 8755',
    ARRAY['pokemon']::public.tcg_type[],
    true
  ),
  (
    'Hobbymaster Doncaster',
    'Shop 371, Westfield Doncaster, 619 Doncaster Rd, Doncaster VIC 3108',
    ST_SetSRID(ST_MakePoint(145.1262, -37.7836), 4326),
    '{"monday": "09:00-17:30", "tuesday": "09:00-17:30", "wednesday": "09:00-17:30", "thursday": "09:00-21:00", "friday": "09:00-21:00", "saturday": "09:00-17:00", "sunday": "10:00-17:00"}'::jsonb,
    'https://www.hobbymaster.com.au',
    '+61 3 9840 4312',
    ARRAY['pokemon', 'mtg', 'yugioh']::public.tcg_type[],
    true
  ),
  (
    'Next Level Games Ringwood',
    '7-9 Melbourne St, Ringwood VIC 3134',
    ST_SetSRID(ST_MakePoint(145.2285, -37.8159), 4326),
    '{"monday": "10:00-18:00", "tuesday": "10:00-18:00", "wednesday": "10:00-18:00", "thursday": "10:00-21:00", "friday": "10:00-21:00", "saturday": "09:00-17:00", "sunday": "10:00-16:00"}'::jsonb,
    'https://www.nextlevelgames.com.au',
    '+61 3 9879 4044',
    ARRAY['pokemon', 'mtg', 'yugioh']::public.tcg_type[],
    true
  ),
  (
    'Tabletop Wonderland',
    '15 Station St, Frankston VIC 3199',
    ST_SetSRID(ST_MakePoint(145.1266, -38.1437), 4326),
    '{"monday": "10:00-17:30", "tuesday": "10:00-17:30", "wednesday": "10:00-17:30", "thursday": "10:00-20:00", "friday": "10:00-20:00", "saturday": "09:30-17:00", "sunday": "10:00-16:00"}'::jsonb,
    NULL,
    '+61 3 9781 3200',
    ARRAY['pokemon', 'mtg']::public.tcg_type[],
    false
  ),
  (
    'Cardtastic TCG',
    '92 Chapel St, Windsor VIC 3181',
    ST_SetSRID(ST_MakePoint(144.9930, -37.8563), 4326),
    '{"monday": "11:00-19:00", "tuesday": "11:00-19:00", "wednesday": "11:00-19:00", "thursday": "11:00-21:00", "friday": "11:00-21:00", "saturday": "10:00-18:00", "sunday": "11:00-17:00"}'::jsonb,
    'https://www.cardtastictcg.com.au',
    '+61 3 9510 7722',
    ARRAY['pokemon', 'yugioh']::public.tcg_type[],
    true
  ),
  (
    'General Games Malvern',
    '1232 Malvern Rd, Malvern VIC 3144',
    ST_SetSRID(ST_MakePoint(145.0338, -37.8621), 4326),
    '{"monday": "10:00-18:00", "tuesday": "10:00-18:00", "wednesday": "10:00-18:00", "thursday": "10:00-21:00", "friday": "10:00-21:00", "saturday": "09:30-17:00", "sunday": "10:30-16:30"}'::jsonb,
    'https://www.generalgames.com.au',
    '+61 3 9500 8226',
    ARRAY['pokemon', 'mtg', 'yugioh']::public.tcg_type[],
    true
  ),
  (
    'Nerd Cave Collectibles',
    '204 Barkly St, Footscray VIC 3011',
    ST_SetSRID(ST_MakePoint(144.8993, -37.7998), 4326),
    '{"monday": "10:00-17:30", "tuesday": "10:00-17:30", "wednesday": "10:00-17:30", "thursday": "10:00-20:00", "friday": "10:00-20:00", "saturday": "10:00-17:00", "sunday": "11:00-16:00"}'::jsonb,
    NULL,
    '+61 3 9687 5510',
    ARRAY['pokemon', 'mtg']::public.tcg_type[],
    false
  );

-- =============================================================================
-- DEV AUTH USER (needed before seed data references it)
-- =============================================================================

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  confirmation_token, recovery_token,
  raw_app_meta_data, raw_user_meta_data
)
SELECT
  gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'bradysuryasie@gmail.com',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(), '', '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Brady"}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'bradysuryasie@gmail.com'
);

-- =============================================================================
-- FULL SEED DATA: Users, Listings, Matches, Conversations, Messages,
--                 Meetups, Ratings, Collection Items
-- =============================================================================

DO $$
DECLARE
  -- Current (real) dev user
  me uuid;

  -- Fake user UUIDs
  u1 uuid := 'a1111111-1111-1111-1111-111111111111';
  u2 uuid := 'a2222222-2222-2222-2222-222222222222';
  u3 uuid := 'a3333333-3333-3333-3333-333333333333';
  u4 uuid := 'a4444444-4444-4444-4444-444444444444';
  u5 uuid := 'a5555555-5555-5555-5555-555555555555';

  -- Listing UUIDs (current user)
  my_l1 uuid := 'b1000001-0000-0000-0000-000000000001';
  my_l2 uuid := 'b1000001-0000-0000-0000-000000000002';
  my_l3 uuid := 'b1000001-0000-0000-0000-000000000003';
  my_l4 uuid := 'b1000001-0000-0000-0000-000000000004';

  -- Listing UUIDs (fake users)
  u1_l1 uuid := 'b2000001-0000-0000-0000-000000000001';
  u1_l2 uuid := 'b2000001-0000-0000-0000-000000000002';
  u2_l1 uuid := 'b2000002-0000-0000-0000-000000000001';
  u2_l2 uuid := 'b2000002-0000-0000-0000-000000000002';
  u3_l1 uuid := 'b2000003-0000-0000-0000-000000000001';
  u3_l2 uuid := 'b2000003-0000-0000-0000-000000000002';
  u4_l1 uuid := 'b2000004-0000-0000-0000-000000000001';
  u4_l2 uuid := 'b2000004-0000-0000-0000-000000000002';
  u5_l1 uuid := 'b2000005-0000-0000-0000-000000000001';
  u5_l2 uuid := 'b2000005-0000-0000-0000-000000000002';

  -- Offer UUIDs (needed by matches)
  offer_1 uuid := 'c1000001-0000-0000-0000-000000000001';
  offer_2 uuid := 'c1000001-0000-0000-0000-000000000002';
  offer_3 uuid := 'c1000001-0000-0000-0000-000000000003';
  offer_4 uuid := 'c1000001-0000-0000-0000-000000000004';

  -- Match UUIDs
  match_1 uuid := 'd1000001-0000-0000-0000-000000000001';
  match_2 uuid := 'd1000001-0000-0000-0000-000000000002';
  match_3 uuid := 'd1000001-0000-0000-0000-000000000003';
  match_4 uuid := 'd1000001-0000-0000-0000-000000000004';

  -- Conversation UUIDs
  conv_1 uuid := 'e1000001-0000-0000-0000-000000000001';
  conv_2 uuid := 'e1000001-0000-0000-0000-000000000002';
  conv_3 uuid := 'e1000001-0000-0000-0000-000000000003';
  conv_4 uuid := 'e1000001-0000-0000-0000-000000000004';

  -- Message UUIDs
  msg_01 uuid := 'f1000001-0000-0000-0000-000000000001';
  msg_02 uuid := 'f1000001-0000-0000-0000-000000000002';
  msg_03 uuid := 'f1000001-0000-0000-0000-000000000003';
  msg_04 uuid := 'f1000001-0000-0000-0000-000000000004';
  msg_05 uuid := 'f1000001-0000-0000-0000-000000000005';
  msg_06 uuid := 'f1000001-0000-0000-0000-000000000006';
  msg_07 uuid := 'f1000001-0000-0000-0000-000000000007';
  msg_08 uuid := 'f1000001-0000-0000-0000-000000000008';
  msg_09 uuid := 'f1000001-0000-0000-0000-000000000009';
  msg_10 uuid := 'f1000001-0000-0000-0000-000000000010';
  msg_11 uuid := 'f1000001-0000-0000-0000-000000000011';
  msg_12 uuid := 'f1000001-0000-0000-0000-000000000012';
  msg_13 uuid := 'f1000001-0000-0000-0000-000000000013';
  msg_14 uuid := 'f1000001-0000-0000-0000-000000000014';
  msg_15 uuid := 'f1000001-0000-0000-0000-000000000015';
  msg_16 uuid := 'f1000001-0000-0000-0000-000000000016';

  -- Meetup UUIDs
  meetup_1 uuid := 'aa000001-0000-0000-0000-000000000001';
  meetup_2 uuid := 'aa000001-0000-0000-0000-000000000002';
  meetup_3 uuid := 'aa000001-0000-0000-0000-000000000003';
  meetup_4 uuid := 'aa000001-0000-0000-0000-000000000004';

  -- Shop IDs (looked up dynamically)
  shop_good_games uuid;
  shop_games_lab uuid;
  shop_cardtastic uuid;
  shop_general uuid;

BEGIN
  -- =========================================================================
  -- Look up the real dev user from auth
  -- =========================================================================
  SELECT id INTO me FROM auth.users WHERE email = 'bradysuryasie@gmail.com' LIMIT 1;

  IF me IS NULL THEN
    RAISE NOTICE 'Dev user (bradysuryasie@gmail.com) not found in auth.users. Skipping seed.';
    RETURN;
  END IF;

  -- Look up shop IDs
  SELECT id INTO shop_good_games FROM public.shops WHERE name = 'Good Games Melbourne' LIMIT 1;
  SELECT id INTO shop_games_lab FROM public.shops WHERE name = 'Games Laboratory' LIMIT 1;
  SELECT id INTO shop_cardtastic FROM public.shops WHERE name = 'Cardtastic TCG' LIMIT 1;
  SELECT id INTO shop_general FROM public.shops WHERE name = 'General Games Malvern' LIMIT 1;

  -- =========================================================================
  -- FAKE AUTH USERS (needed for FK to public.users)
  -- =========================================================================
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES
    ('00000000-0000-0000-0000-000000000000', u1, 'authenticated', 'authenticated', 'alex.chen@example.com',     crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '60 days', now()),
    ('00000000-0000-0000-0000-000000000000', u2, 'authenticated', 'authenticated', 'sarah.mitchell@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '45 days', now()),
    ('00000000-0000-0000-0000-000000000000', u3, 'authenticated', 'authenticated', 'james.wilson@example.com',   crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '30 days', now()),
    ('00000000-0000-0000-0000-000000000000', u4, 'authenticated', 'authenticated', 'emma.rodriguez@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '90 days', now()),
    ('00000000-0000-0000-0000-000000000000', u5, 'authenticated', 'authenticated', 'liam.obrien@example.com',    crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '20 days', now())
  ON CONFLICT (id) DO NOTHING;

  -- =========================================================================
  -- FAKE PUBLIC USERS
  -- =========================================================================
  INSERT INTO public.users (id, email, display_name, avatar_url, location, radius_km, preferred_tcgs, rating_score, total_trades)
  VALUES
    (u1, 'alex.chen@example.com',     'Alex Chen',       NULL, ST_SetSRID(ST_MakePoint(144.9631, -37.8136), 4326), 25, ARRAY['pokemon']::public.tcg_type[],                   4.80, 12),
    (u2, 'sarah.mitchell@example.com', 'Sarah Mitchell',  NULL, ST_SetSRID(ST_MakePoint(144.9590, -37.8180), 4326), 30, ARRAY['mtg', 'pokemon']::public.tcg_type[],            4.50,  8),
    (u3, 'james.wilson@example.com',   'James Wilson',    NULL, ST_SetSRID(ST_MakePoint(145.0340, -37.8625), 4326), 20, ARRAY['yugioh']::public.tcg_type[],                    4.20,  5),
    (u4, 'emma.rodriguez@example.com', 'Emma Rodriguez',  NULL, ST_SetSRID(ST_MakePoint(144.9930, -37.8560), 4326), 35, ARRAY['pokemon', 'mtg', 'yugioh']::public.tcg_type[],  4.90, 20),
    (u5, 'liam.obrien@example.com',    'Liam O''Brien',   NULL, ST_SetSRID(ST_MakePoint(145.1260, -37.7840), 4326), 15, ARRAY['pokemon']::public.tcg_type[],                   3.80,  3)
  ON CONFLICT (id) DO NOTHING;

  -- Ensure the dev user exists in public.users, then update with location + preferences
  INSERT INTO public.users (id, email, display_name)
  VALUES (me, 'bradysuryasie@gmail.com', 'Brady')
  ON CONFLICT (id) DO NOTHING;

  UPDATE public.users
  SET
    location = ST_SetSRID(ST_MakePoint(144.9632, -37.8142), 4326),
    radius_km = 30,
    preferred_tcgs = ARRAY['pokemon', 'mtg', 'yugioh']::public.tcg_type[],
    rating_score = 4.70,
    total_trades = 4
  WHERE id = me;

  -- =========================================================================
  -- LISTINGS (bundle schema: title, cash_amount, total_value)
  -- =========================================================================

  -- Current user's listings
  INSERT INTO public.listings (id, user_id, type, tcg, title, cash_amount, total_value, description, status, created_at)
  VALUES
    (my_l1, me, 'wts', 'pokemon', 'Charizard VMAX',         42.00, 87.00,  'Perfect condition, sleeved immediately after pulling.',                   'active',  now() - interval '6 days'),
    (my_l2, me, 'wtb', 'yugioh',  'Dark Magician',          20.00, 45.00,  'Looking for the original LOB art. LP or better.',                        'active',  now() - interval '5 days'),
    (my_l3, me, 'wtt', 'mtg',     'Force of Will',           0.00, 85.00,  'Trading for dual lands or other Legacy staples.',                        'active',  now() - interval '4 days'),
    (my_l4, me, 'wts', 'pokemon', 'Pikachu VMAX',           16.00, 34.50,  'Rainbow chonky boy. Mint condition.',                                    'matched', now() - interval '12 days')
  ON CONFLICT (id) DO NOTHING;

  -- Fake user listings (appear in feed for swiping)
  INSERT INTO public.listings (id, user_id, type, tcg, title, cash_amount, total_value, description, status, created_at)
  VALUES
    -- Alex Chen - Pokemon collector
    (u1_l1, u1, 'wts', 'pokemon', 'Umbreon VMAX Alt Art',  170.00, 350.00, 'Pristine alt art Umbreon. Centering is excellent.',            'active',  now() - interval '3 days'),
    (u1_l2, u1, 'wtb', 'pokemon', 'Charizard ex SAR',       80.00, 175.00, 'Need this for my Charizard collection. NM only please.',       'active',  now() - interval '2 days'),

    -- Sarah Mitchell - MTG player
    (u2_l1, u2, 'wts', 'mtg',     'Ragavan, Nimble Pilferer', 50.00, 105.00, 'Pack fresh Modern staple. Can meet at Good Games.',            'active',  now() - interval '4 days'),
    (u2_l2, u2, 'wtt', 'mtg',     'The One Ring',              0.00,  65.00, 'Trading for Modern or Legacy staples. Prefer in-person.',      'active',  now() - interval '1 day'),

    -- James Wilson - YuGiOh fan
    (u3_l1, u3, 'wts', 'yugioh',  'Blue-Eyes White Dragon',   35.00,  75.00, 'Classic BEWD from LOB. Light play, no creases.',               'active',  now() - interval '8 days'),
    (u3_l2, u3, 'wtt', 'yugioh',  'Ash Blossom & Joyous Spring', 0.00, 22.00, 'Trading for other hand traps or meta staples.',                'active',  now() - interval '6 days'),

    -- Emma Rodriguez - Multi-TCG
    (u4_l1, u4, 'wts', 'pokemon', 'Mew VMAX Alt Art',       50.00, 105.00, 'Beautiful alt art, freshly pulled. Sleeved and top-loaded.',   'active',  now() - interval '2 days'),
    (u4_l2, u4, 'wts', 'mtg',     'Sheoldred, the Apocalypse', 70.00, 145.00, 'Standard powerhouse. Can meet anywhere in Melbourne.',         'active',  now() - interval '5 days'),

    -- Liam O'Brien - Casual Pokemon
    (u5_l1, u5, 'wts', 'pokemon', 'Gengar VMAX Alt Art',    25.00,  53.00, 'Alt art Gengar. Prefer local trade at a card shop.',           'active',  now() - interval '1 day'),
    (u5_l2, u5, 'wtb', 'pokemon', 'Pikachu VMAX Rainbow',  180.00, 380.00, 'Chasing the rainbow Pikachu! Please help.',                   'active',  now() - interval '3 days')
  ON CONFLICT (id) DO NOTHING;

  -- =========================================================================
  -- LISTING ITEMS (one per listing, with card details and images)
  -- =========================================================================

  INSERT INTO public.listing_items (listing_id, card_name, card_image_url, card_external_id, tcg, card_set, card_number, card_rarity, condition, market_price, asking_price, quantity)
  VALUES
    -- Current user
    (my_l1, 'Charizard VMAX',   'https://images.pokemontcg.io/swsh3/20_hires.png',                                                'swsh3-20',  'pokemon', 'Darkness Ablaze',    '020/189', 'VMAX',             'nm', 45.00,  42.00, 1),
    (my_l2, 'Dark Magician',    'https://images.ygoprodeck.com/images/cards_small/46986414.jpg',                                    'LOB-005',   'yugioh',  'Legend of Blue Eyes', 'LOB-005', 'Ultra Rare',       'lp', 25.00,  20.00, 1),
    (my_l3, 'Force of Will',    'https://cards.scryfall.io/normal/front/c/9/c9c7cf66-5a68-4834-98ea-47a25e46f4ed.jpg',              'ALL-42',    'mtg',     'Alliances',           '42',      'Uncommon',         'lp', 85.00,  NULL,  1),
    (my_l4, 'Pikachu VMAX',     'https://images.pokemontcg.io/swsh4/44_hires.png',                                                 'swsh4-44',  'pokemon', 'Vivid Voltage',       '044/185', 'VMAX',             'nm', 18.50,  16.00, 1),

    -- Alex Chen
    (u1_l1, 'Umbreon VMAX Alt Art', 'https://images.pokemontcg.io/swsh7/215_hires.png',                                            'swsh7-215', 'pokemon', 'Evolving Skies',      '215/203', 'Secret Rare',      'nm', 180.00, 170.00, 1),
    (u1_l2, 'Charizard ex SAR',     'https://images.pokemontcg.io/sv3/234_hires.png',                                              'sv3-234',   'pokemon', 'Obsidian Flames',     '234/197', 'Special Art Rare', 'nm', 95.00,  80.00,  1),

    -- Sarah Mitchell
    (u2_l1, 'Ragavan, Nimble Pilferer', 'https://cards.scryfall.io/normal/front/a/9/a9738cda-adb1-47fb-9f4c-ecd930228c4d.jpg',     'MH2-138',   'mtg',     'Modern Horizons 2',   '138',     'Mythic Rare',      'nm', 55.00,  50.00,  1),
    (u2_l2, 'The One Ring',             'https://cards.scryfall.io/normal/front/d/5/d5806e68-1054-458e-866d-1f2470f682b2.jpg',      'LTR-246',   'mtg',     'Tales of Middle-earth','246',     'Mythic Rare',      'nm', 65.00,  NULL,   1),

    -- James Wilson
    (u3_l1, 'Blue-Eyes White Dragon',      'https://images.ygoprodeck.com/images/cards_small/89631139.jpg',                         'LOB-001',   'yugioh',  'Legend of Blue Eyes',  'LOB-001', 'Ultra Rare',       'lp', 40.00,  35.00, 1),
    (u3_l2, 'Ash Blossom & Joyous Spring', 'https://images.ygoprodeck.com/images/cards_small/14558127.jpg',                        'MACR-036',  'yugioh',  'Maximum Crisis',       'MACR-036','Secret Rare',      'nm', 22.00,  NULL,  1),

    -- Emma Rodriguez
    (u4_l1, 'Mew VMAX Alt Art',         'https://images.pokemontcg.io/swsh8/268_hires.png',                                        'swsh8-268', 'pokemon', 'Fusion Strike',        '268/264', 'Secret Rare',      'nm', 55.00,  50.00, 1),
    (u4_l2, 'Sheoldred, the Apocalypse','https://cards.scryfall.io/normal/front/d/6/d67be074-cdd4-41d9-ac89-0a0456c4e4b2.jpg',     'DMU-107',   'mtg',     'Dominaria United',     '107',     'Mythic Rare',      'nm', 75.00,  70.00, 1),

    -- Liam O'Brien
    (u5_l1, 'Gengar VMAX Alt Art',   'https://images.pokemontcg.io/swsh8/271_hires.png',                                           'swsh8-271', 'pokemon', 'Fusion Strike',        '271/264', 'Secret Rare',      'nm', 28.00,  25.00,  1),
    (u5_l2, 'Pikachu VMAX Rainbow',  'https://images.pokemontcg.io/swsh4/188_hires.png',                                           'swsh4-188', 'pokemon', 'Vivid Voltage',        '188/185', 'Secret Rare',      'nm', 200.00, 180.00, 1)
  ON CONFLICT DO NOTHING;

  -- =========================================================================
  -- OFFERS (needed by matches in the bundle schema)
  -- =========================================================================
  INSERT INTO public.offers (id, listing_id, offerer_id, status, cash_amount, message, created_at)
  VALUES
    (offer_1, my_l1, u1,  'accepted',  80.00, 'I have the Charizard ex SAR you want! Straight swap?',  now() - interval '5 days'),
    (offer_2, my_l3, u2,  'accepted',   0.00, 'Will trade my One Ring for your Force of Will.',        now() - interval '3 days'),
    (offer_3, my_l2, u3,  'accepted',  35.00, 'I have a LOB Dark Magician for you!',                   now() - interval '14 days'),
    (offer_4, my_l4, u4,  'accepted',  50.00, 'Interested in your Pikachu VMAX.',                      now() - interval '10 days')
  ON CONFLICT (id) DO NOTHING;

  -- =========================================================================
  -- MATCHES (4 matches involving current user)
  -- =========================================================================
  INSERT INTO public.matches (id, user_a_id, user_b_id, listing_id, offer_id, status, created_at)
  VALUES
    -- Active: me + Alex (Pokemon trade)
    (match_1, me, u1, my_l1, offer_1, 'active',    now() - interval '5 days'),
    -- Active: me + Sarah (MTG trade)
    (match_2, me, u2, my_l3, offer_2, 'active',    now() - interval '3 days'),
    -- Completed: me + James (YuGiOh trade)
    (match_3, me, u3, my_l2, offer_3, 'completed', now() - interval '14 days'),
    -- Completed: me + Emma (Pokemon trade)
    (match_4, me, u4, my_l4, offer_4, 'completed', now() - interval '10 days')
  ON CONFLICT (id) DO NOTHING;

  -- =========================================================================
  -- CONVERSATIONS (1 per match)
  -- =========================================================================
  INSERT INTO public.conversations (id, match_id, created_at)
  VALUES
    (conv_1, match_1, now() - interval '5 days'),
    (conv_2, match_2, now() - interval '3 days'),
    (conv_3, match_3, now() - interval '14 days'),
    (conv_4, match_4, now() - interval '10 days')
  ON CONFLICT (id) DO NOTHING;

  -- =========================================================================
  -- MESSAGES
  -- =========================================================================
  INSERT INTO public.messages (id, conversation_id, sender_id, type, body, payload, created_at)
  VALUES
    -- Conv 1: me + Alex Chen (Pokemon, active match)
    (msg_01, conv_1, u1, 'text', 'Hey! I saw your Charizard VMAX listing. I have the Charizard ex you want!', NULL, now() - interval '5 days'),
    (msg_02, conv_1, me, 'text', 'Nice! The VMAX is in perfect condition. Can I see pics of the ex?', NULL, now() - interval '4 days 23 hours'),
    (msg_03, conv_1, u1, 'text', 'Here it is. Centering is great, no whitening on the edges.', NULL, now() - interval '4 days 20 hours'),
    (msg_04, conv_1, me, 'text', 'Looks awesome! Want to meet up this weekend?', NULL, now() - interval '4 days 18 hours'),
    (msg_05, conv_1, u1, 'meetup_proposal', 'How about Good Games Melbourne on Saturday at 2pm?',
      jsonb_build_object('shop_id', shop_good_games, 'location_name', 'Good Games Melbourne', 'proposed_time', (now() + interval '2 days')::text),
      now() - interval '4 days 16 hours'),

    -- Conv 2: me + Sarah Mitchell (MTG, active match)
    (msg_06, conv_2, me, 'text', 'Hi Sarah! Interested in trading my Force of Will for your The One Ring?', NULL, now() - interval '3 days'),
    (msg_07, conv_2, u2, 'text', 'Hey! Yeah I would be down for that. Force of Will is one of my favourite cards.', NULL, now() - interval '2 days 22 hours'),
    (msg_08, conv_2, me, 'text', 'Great! Mine is LP, been in a binder forever. Want to meet at a shop?', NULL, now() - interval '2 days 20 hours'),
    (msg_09, conv_2, u2, 'meetup_proposal', 'Cardtastic TCG on Sunday at 1pm?',
      jsonb_build_object('shop_id', shop_cardtastic, 'location_name', 'Cardtastic TCG', 'proposed_time', (now() + interval '3 days')::text),
      now() - interval '2 days 18 hours'),

    -- Conv 3: me + James Wilson (YuGiOh, completed)
    (msg_10, conv_3, u3, 'text', 'Hey, saw you are looking for Dark Magician LOB. I have one!', NULL, now() - interval '14 days'),
    (msg_11, conv_3, me, 'text', 'Awesome! What condition is it in?', NULL, now() - interval '13 days 22 hours'),
    (msg_12, conv_3, u3, 'text', 'Light play, edges are clean. I can do $35 for it.', NULL, now() - interval '13 days 20 hours'),
    (msg_13, conv_3, me, 'text', 'Deal! When can we meet?', NULL, now() - interval '13 days 18 hours'),
    (msg_14, conv_3, u3, 'meetup_proposal', 'Games Laboratory, Friday at 5pm?',
      jsonb_build_object('shop_id', shop_games_lab, 'location_name', 'Games Laboratory', 'proposed_time', (now() - interval '7 days')::text),
      now() - interval '13 days'),

    -- Conv 4: me + Emma Rodriguez (Pokemon, completed)
    (msg_15, conv_4, u4, 'text', 'Your Pikachu VMAX is exactly what I need! Want to trade for my Mew VMAX Alt Art?', NULL, now() - interval '10 days'),
    (msg_16, conv_4, me, 'text', 'That sounds like a great trade! Let us meet at General Games Malvern.', NULL, now() - interval '9 days 22 hours')
  ON CONFLICT (id) DO NOTHING;

  -- =========================================================================
  -- MEETUPS
  -- =========================================================================
  INSERT INTO public.meetups (id, match_id, proposal_message_id, shop_id, location_name, proposed_time, status, user_a_completed, user_b_completed, created_at)
  VALUES
    -- Upcoming: me + Alex at Good Games Melbourne
    (meetup_1, match_1, msg_05, shop_good_games, 'Good Games Melbourne',  now() + interval '2 days',  'confirmed', false, false, now() - interval '4 days 16 hours'),
    -- Upcoming: me + Sarah at Cardtastic TCG
    (meetup_2, match_2, msg_09, shop_cardtastic, 'Cardtastic TCG',        now() + interval '3 days',  'confirmed', false, false, now() - interval '2 days 18 hours'),
    -- Past completed: me + James at Games Laboratory
    (meetup_3, match_3, msg_14, shop_games_lab,  'Games Laboratory',      now() - interval '7 days',  'completed', true,  true,  now() - interval '13 days'),
    -- Past completed: me + Emma at General Games
    (meetup_4, match_4, msg_16, shop_general,    'General Games Malvern', now() - interval '8 days',  'completed', true,  true,  now() - interval '9 days')
  ON CONFLICT (id) DO NOTHING;

  -- =========================================================================
  -- RATINGS (from completed meetups)
  -- =========================================================================
  INSERT INTO public.ratings (meetup_id, rater_id, ratee_id, score, comment, created_at)
  VALUES
    -- Meetup 3: me <-> James
    (meetup_3, u3, me, 5, 'Great trader! Card was exactly as described. Very friendly.',       now() - interval '6 days'),
    (meetup_3, me, u3, 4, 'Good trade, card was in nice condition. Would trade again!',        now() - interval '6 days'),
    -- Meetup 4: me <-> Emma
    (meetup_4, u4, me, 4, 'Smooth transaction, quick and easy meetup. Thanks!',                now() - interval '7 days'),
    (meetup_4, me, u4, 5, 'Amazing trader! The Mew VMAX is gorgeous. Highly recommended.',     now() - interval '7 days')
  ON CONFLICT DO NOTHING;

  -- =========================================================================
  -- COLLECTION ITEMS (for current user)
  -- =========================================================================

  -- Regular cards (is_wishlist=false, is_sealed=false)
  -- Each physical card = 1 row with quantity 1.
  -- Cards with the same external_id are grouped in the UI.
  INSERT INTO public.collection_items (user_id, tcg, external_id, card_name, set_name, set_code, card_number, image_url, rarity, condition, quantity, is_wishlist, market_price, grading_company, grading_score, is_sealed, product_type, purchase_price)
  VALUES
    -- Charizard VMAX: 2 physical cards (NM + LP) → grouped in UI
    (me, 'pokemon', 'swsh3-20',  'Charizard VMAX',        'Darkness Ablaze',  'swsh3', '020/189', 'https://images.pokemontcg.io/swsh3/20_hires.png',  'VMAX',            'nm', 1, false, 45.00,  NULL,  NULL,  false, NULL, NULL),
    (me, 'pokemon', 'swsh3-20',  'Charizard VMAX',        'Darkness Ablaze',  'swsh3', '020/189', 'https://images.pokemontcg.io/swsh3/20_hires.png',  'VMAX',            'lp', 1, false, 42.00,  NULL,  NULL,  false, NULL, 40.00),
    (me, 'pokemon', 'swsh7-215', 'Umbreon VMAX Alt Art',  'Evolving Skies',   'swsh7', '215/203', 'https://images.pokemontcg.io/swsh7/215_hires.png', 'Secret Rare',     'nm', 1, false, 180.00, 'psa', '10',  false, NULL, NULL),
    (me, 'pokemon', 'sv3-234',   'Charizard ex SAR',      'Obsidian Flames',  'sv3',   '234/197', 'https://images.pokemontcg.io/sv3/234_hires.png',   'Special Art Rare','nm', 1, false, 95.00,  NULL,  NULL,  false, NULL, NULL),
    (me, 'pokemon', 'swsh4-44',  'Pikachu VMAX',          'Vivid Voltage',    'swsh4', '044/185', 'https://images.pokemontcg.io/swsh4/44_hires.png',  'VMAX',            'lp', 1, false, 18.50,  NULL,  NULL,  false, NULL, NULL),
    (me, 'pokemon', 'swsh8-268', 'Mew VMAX Alt Art',      'Fusion Strike',    'swsh8', '268/264', 'https://images.pokemontcg.io/swsh8/268_hires.png', 'Secret Rare',     'nm', 1, false, 55.00,  'cgc', '9.5', false, NULL, NULL),
    -- Ragavan: 2 physical cards (NM ungraded + NM PSA 9) → grouped in UI
    (me, 'mtg',     'MH2-138',   'Ragavan, Nimble Pilferer','Modern Horizons 2','MH2',  '138',    'https://cards.scryfall.io/normal/front/a/9/a9738cda-adb1-47fb-9f4c-ecd930228c4d.jpg', 'Mythic Rare', 'nm', 1, false, 55.00,  NULL,  NULL,  false, NULL, NULL),
    (me, 'mtg',     'MH2-138',   'Ragavan, Nimble Pilferer','Modern Horizons 2','MH2',  '138',    'https://cards.scryfall.io/normal/front/a/9/a9738cda-adb1-47fb-9f4c-ecd930228c4d.jpg', 'Mythic Rare', 'nm', 1, false, 60.00,  'psa', '9',   false, NULL, 50.00),
    (me, 'mtg',     'ALL-42',    'Force of Will',          'Alliances',        'ALL',   '42',     'https://cards.scryfall.io/normal/front/c/9/c9c7cf66-5a68-4834-98ea-47a25e46f4ed.jpg', 'Uncommon', 'lp', 1, false, 85.00,  NULL,  NULL,  false, NULL, NULL),
    (me, 'yugioh',  'LOB-005',   'Dark Magician',          'Legend of Blue Eyes','LOB',  '005',    'https://images.ygoprodeck.com/images/cards_small/46986414.jpg', 'Ultra Rare', 'mp', 1, false, 25.00,  NULL,  NULL,  false, NULL, NULL)
  ON CONFLICT DO NOTHING;

  -- Wishlist items (is_wishlist=true)
  INSERT INTO public.collection_items (user_id, tcg, external_id, card_name, set_name, set_code, card_number, image_url, rarity, condition, quantity, is_wishlist, market_price, is_sealed, product_type, purchase_price)
  VALUES
    (me, 'pokemon', 'swsh4-188', 'Pikachu VMAX Rainbow',  'Vivid Voltage',    'swsh4', '188/185', 'https://images.pokemontcg.io/swsh4/188_hires.png', 'Secret Rare', 'nm', 1, true, 200.00, false, NULL, NULL),
    (me, 'mtg',     'LTR-246',   'The One Ring',           'Tales of Middle-earth','LTR','246',    'https://cards.scryfall.io/normal/front/d/5/d5806e68-1054-458e-866d-1f2470f682b2.jpg', 'Mythic Rare', 'nm', 1, true, 65.00,  false, NULL, NULL)
  ON CONFLICT DO NOTHING;

  -- Sealed products (is_sealed=true)
  INSERT INTO public.collection_items (user_id, tcg, external_id, card_name, set_name, set_code, card_number, image_url, condition, quantity, is_wishlist, is_sealed, product_type, purchase_price, market_price)
  VALUES
    (me, 'pokemon', 'sealed-sv3-bb',   'Obsidian Flames Booster Box',       'Obsidian Flames', 'sv3',   '', '', 'nm', 1, false, true, 'booster_box', 145.00, 165.00),
    (me, 'pokemon', 'sealed-swsh7-etb','Evolving Skies Elite Trainer Box',  'Evolving Skies',  'swsh7', '', '', 'nm', 1, false, true, 'etb',         55.00,  75.00),
    (me, 'pokemon', 'sealed-swsh7-etb','Evolving Skies Elite Trainer Box',  'Evolving Skies',  'swsh7', '', '', 'nm', 1, false, true, 'etb',         55.00,  75.00)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed data inserted successfully for user %', me;
END $$;
