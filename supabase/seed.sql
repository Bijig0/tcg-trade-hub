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
--                 Meetups, Ratings, Collection Items, Offers, Swipes
-- =============================================================================

DO $$
DECLARE
  -- Current (real) dev user
  me uuid;

  -- Fake user UUIDs (original 5)
  u1 uuid := 'a1111111-1111-1111-1111-111111111111';
  u2 uuid := 'a2222222-2222-2222-2222-222222222222';
  u3 uuid := 'a3333333-3333-3333-3333-333333333333';
  u4 uuid := 'a4444444-4444-4444-4444-444444444444';
  u5 uuid := 'a5555555-5555-5555-5555-555555555555';

  -- Additional fake users (8 more for a richer feed)
  u6  uuid := 'a6666666-6666-6666-6666-666666666666';
  u7  uuid := 'a7777777-7777-7777-7777-777777777777';
  u8  uuid := 'a8888888-8888-8888-8888-888888888888';
  u9  uuid := 'a9999999-9999-9999-9999-999999999999';
  u10 uuid := 'a1010101-1010-1010-1010-101010101010';
  u11 uuid := 'a1111111-2222-3333-4444-555555555555';
  u12 uuid := 'a1212121-1212-1212-1212-121212121212';
  u13 uuid := 'a1313131-1313-1313-1313-131313131313';

  -- Listing UUIDs (current user)
  my_l1 uuid := 'b1000001-0000-0000-0000-000000000001';
  my_l2 uuid := 'b1000001-0000-0000-0000-000000000002';
  my_l3 uuid := 'b1000001-0000-0000-0000-000000000003';
  my_l4 uuid := 'b1000001-0000-0000-0000-000000000004';
  my_l5 uuid := 'b1000001-0000-0000-0000-000000000005';
  my_l6 uuid := 'b1000001-0000-0000-0000-000000000006';

  -- Listing UUIDs (original fake users)
  u1_l1 uuid := 'b2000001-0000-0000-0000-000000000001';
  u1_l2 uuid := 'b2000001-0000-0000-0000-000000000002';
  u1_l3 uuid := 'b2000001-0000-0000-0000-000000000003';
  u2_l1 uuid := 'b2000002-0000-0000-0000-000000000001';
  u2_l2 uuid := 'b2000002-0000-0000-0000-000000000002';
  u2_l3 uuid := 'b2000002-0000-0000-0000-000000000003';
  u3_l1 uuid := 'b2000003-0000-0000-0000-000000000001';
  u3_l2 uuid := 'b2000003-0000-0000-0000-000000000002';
  u3_l3 uuid := 'b2000003-0000-0000-0000-000000000003';
  u4_l1 uuid := 'b2000004-0000-0000-0000-000000000001';
  u4_l2 uuid := 'b2000004-0000-0000-0000-000000000002';
  u4_l3 uuid := 'b2000004-0000-0000-0000-000000000003';
  u5_l1 uuid := 'b2000005-0000-0000-0000-000000000001';
  u5_l2 uuid := 'b2000005-0000-0000-0000-000000000002';

  -- Listing UUIDs (new users)
  u6_l1  uuid := 'b2000006-0000-0000-0000-000000000001';
  u6_l2  uuid := 'b2000006-0000-0000-0000-000000000002';
  u6_l3  uuid := 'b2000006-0000-0000-0000-000000000003';
  u7_l1  uuid := 'b2000007-0000-0000-0000-000000000001';
  u7_l2  uuid := 'b2000007-0000-0000-0000-000000000002';
  u7_l3  uuid := 'b2000007-0000-0000-0000-000000000003';
  u8_l1  uuid := 'b2000008-0000-0000-0000-000000000001';
  u8_l2  uuid := 'b2000008-0000-0000-0000-000000000002';
  u8_l3  uuid := 'b2000008-0000-0000-0000-000000000003';
  u9_l1  uuid := 'b2000009-0000-0000-0000-000000000001';
  u9_l2  uuid := 'b2000009-0000-0000-0000-000000000002';
  u10_l1 uuid := 'b2000010-0000-0000-0000-000000000001';
  u10_l2 uuid := 'b2000010-0000-0000-0000-000000000002';
  u10_l3 uuid := 'b2000010-0000-0000-0000-000000000003';
  u11_l1 uuid := 'b2000011-0000-0000-0000-000000000001';
  u11_l2 uuid := 'b2000011-0000-0000-0000-000000000002';
  u12_l1 uuid := 'b2000012-0000-0000-0000-000000000001';
  u12_l2 uuid := 'b2000012-0000-0000-0000-000000000002';
  u12_l3 uuid := 'b2000012-0000-0000-0000-000000000003';
  u13_l1 uuid := 'b2000013-0000-0000-0000-000000000001';
  u13_l2 uuid := 'b2000013-0000-0000-0000-000000000002';
  u13_l3 uuid := 'b2000013-0000-0000-0000-000000000003';

  -- Offer UUIDs
  offer_1  uuid := 'c1000001-0000-0000-0000-000000000001';
  offer_2  uuid := 'c1000001-0000-0000-0000-000000000002';
  offer_3  uuid := 'c1000001-0000-0000-0000-000000000003';
  offer_4  uuid := 'c1000001-0000-0000-0000-000000000004';
  offer_5  uuid := 'c1000001-0000-0000-0000-000000000005';
  offer_6  uuid := 'c1000001-0000-0000-0000-000000000006';
  offer_7  uuid := 'c1000001-0000-0000-0000-000000000007';
  offer_8  uuid := 'c1000001-0000-0000-0000-000000000008';
  offer_9  uuid := 'c1000001-0000-0000-0000-000000000009';
  offer_10 uuid := 'c1000001-0000-0000-0000-000000000010';

  -- Match UUIDs
  match_1 uuid := 'd1000001-0000-0000-0000-000000000001';
  match_2 uuid := 'd1000001-0000-0000-0000-000000000002';
  match_3 uuid := 'd1000001-0000-0000-0000-000000000003';
  match_4 uuid := 'd1000001-0000-0000-0000-000000000004';
  match_5 uuid := 'd1000001-0000-0000-0000-000000000005';
  match_6 uuid := 'd1000001-0000-0000-0000-000000000006';

  -- Conversation UUIDs
  conv_1 uuid := 'e1000001-0000-0000-0000-000000000001';
  conv_2 uuid := 'e1000001-0000-0000-0000-000000000002';
  conv_3 uuid := 'e1000001-0000-0000-0000-000000000003';
  conv_4 uuid := 'e1000001-0000-0000-0000-000000000004';
  conv_5 uuid := 'e1000001-0000-0000-0000-000000000005';
  conv_6 uuid := 'e1000001-0000-0000-0000-000000000006';

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
  msg_17 uuid := 'f1000001-0000-0000-0000-000000000017';
  msg_18 uuid := 'f1000001-0000-0000-0000-000000000018';
  msg_19 uuid := 'f1000001-0000-0000-0000-000000000019';
  msg_20 uuid := 'f1000001-0000-0000-0000-000000000020';
  msg_21 uuid := 'f1000001-0000-0000-0000-000000000021';
  msg_22 uuid := 'f1000001-0000-0000-0000-000000000022';
  msg_23 uuid := 'f1000001-0000-0000-0000-000000000023';
  msg_24 uuid := 'f1000001-0000-0000-0000-000000000024';
  msg_25 uuid := 'f1000001-0000-0000-0000-000000000025';
  msg_26 uuid := 'f1000001-0000-0000-0000-000000000026';
  msg_27 uuid := 'f1000001-0000-0000-0000-000000000027';
  msg_28 uuid := 'f1000001-0000-0000-0000-000000000028';
  msg_29 uuid := 'f1000001-0000-0000-0000-000000000029';
  msg_30 uuid := 'f1000001-0000-0000-0000-000000000030';
  msg_31 uuid := 'f1000001-0000-0000-0000-000000000031';
  msg_32 uuid := 'f1000001-0000-0000-0000-000000000032';

  -- Meetup UUIDs
  meetup_1 uuid := 'aa000001-0000-0000-0000-000000000001';
  meetup_2 uuid := 'aa000001-0000-0000-0000-000000000002';
  meetup_3 uuid := 'aa000001-0000-0000-0000-000000000003';
  meetup_4 uuid := 'aa000001-0000-0000-0000-000000000004';
  meetup_5 uuid := 'aa000001-0000-0000-0000-000000000005';
  meetup_6 uuid := 'aa000001-0000-0000-0000-000000000006';

  -- Shop IDs (looked up dynamically)
  shop_good_games  uuid;
  shop_games_lab   uuid;
  shop_cardtastic  uuid;
  shop_general     uuid;
  shop_dungeon     uuid;
  shop_cherry      uuid;
  shop_hobbymaster uuid;
  shop_nerd_cave   uuid;

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
  SELECT id INTO shop_good_games  FROM public.shops WHERE name = 'Good Games Melbourne' LIMIT 1;
  SELECT id INTO shop_games_lab   FROM public.shops WHERE name = 'Games Laboratory' LIMIT 1;
  SELECT id INTO shop_cardtastic  FROM public.shops WHERE name = 'Cardtastic TCG' LIMIT 1;
  SELECT id INTO shop_general     FROM public.shops WHERE name = 'General Games Malvern' LIMIT 1;
  SELECT id INTO shop_dungeon     FROM public.shops WHERE name = 'Dungeon of Magic' LIMIT 1;
  SELECT id INTO shop_cherry      FROM public.shops WHERE name = 'Cherry Collectables' LIMIT 1;
  SELECT id INTO shop_hobbymaster FROM public.shops WHERE name = 'Hobbymaster Doncaster' LIMIT 1;
  SELECT id INTO shop_nerd_cave   FROM public.shops WHERE name = 'Nerd Cave Collectibles' LIMIT 1;

  -- =========================================================================
  -- FAKE AUTH USERS (13 total)
  -- =========================================================================
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES
    ('00000000-0000-0000-0000-000000000000', u1,  'authenticated', 'authenticated', 'alex.chen@example.com',       crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '60 days',  now()),
    ('00000000-0000-0000-0000-000000000000', u2,  'authenticated', 'authenticated', 'sarah.mitchell@example.com',   crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '45 days',  now()),
    ('00000000-0000-0000-0000-000000000000', u3,  'authenticated', 'authenticated', 'james.wilson@example.com',     crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '30 days',  now()),
    ('00000000-0000-0000-0000-000000000000', u4,  'authenticated', 'authenticated', 'emma.rodriguez@example.com',   crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '90 days',  now()),
    ('00000000-0000-0000-0000-000000000000', u5,  'authenticated', 'authenticated', 'liam.obrien@example.com',      crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '20 days',  now()),
    ('00000000-0000-0000-0000-000000000000', u6,  'authenticated', 'authenticated', 'mia.zhang@example.com',        crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '55 days',  now()),
    ('00000000-0000-0000-0000-000000000000', u7,  'authenticated', 'authenticated', 'noah.patel@example.com',       crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '40 days',  now()),
    ('00000000-0000-0000-0000-000000000000', u8,  'authenticated', 'authenticated', 'olivia.kim@example.com',       crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '70 days',  now()),
    ('00000000-0000-0000-0000-000000000000', u9,  'authenticated', 'authenticated', 'ethan.brooks@example.com',     crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '35 days',  now()),
    ('00000000-0000-0000-0000-000000000000', u10, 'authenticated', 'authenticated', 'sophie.turner@example.com',    crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '100 days', now()),
    ('00000000-0000-0000-0000-000000000000', u11, 'authenticated', 'authenticated', 'ryan.nakamura@example.com',    crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '25 days',  now()),
    ('00000000-0000-0000-0000-000000000000', u12, 'authenticated', 'authenticated', 'chloe.anderson@example.com',   crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '50 days',  now()),
    ('00000000-0000-0000-0000-000000000000', u13, 'authenticated', 'authenticated', 'daniel.lee@example.com',       crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '65 days',  now())
  ON CONFLICT (id) DO NOTHING;

  -- =========================================================================
  -- PUBLIC USERS (13 fake + dev user)
  -- All located around Melbourne with varying radii
  -- =========================================================================
  INSERT INTO public.users (id, email, display_name, avatar_url, location, radius_km, preferred_tcgs, rating_score, total_trades)
  VALUES
    (u1,  'alex.chen@example.com',       'Alex Chen',        NULL, ST_SetSRID(ST_MakePoint(144.9631, -37.8136), 4326), 25, ARRAY['pokemon']::public.tcg_type[],                   4.80, 12),
    (u2,  'sarah.mitchell@example.com',   'Sarah Mitchell',   NULL, ST_SetSRID(ST_MakePoint(144.9590, -37.8180), 4326), 30, ARRAY['mtg', 'pokemon']::public.tcg_type[],            4.50,  8),
    (u3,  'james.wilson@example.com',     'James Wilson',     NULL, ST_SetSRID(ST_MakePoint(145.0340, -37.8625), 4326), 20, ARRAY['yugioh']::public.tcg_type[],                    4.20,  5),
    (u4,  'emma.rodriguez@example.com',   'Emma Rodriguez',   NULL, ST_SetSRID(ST_MakePoint(144.9930, -37.8560), 4326), 35, ARRAY['pokemon', 'mtg', 'yugioh']::public.tcg_type[],  4.90, 20),
    (u5,  'liam.obrien@example.com',      'Liam O''Brien',    NULL, ST_SetSRID(ST_MakePoint(145.1260, -37.7840), 4326), 15, ARRAY['pokemon']::public.tcg_type[],                   3.80,  3),
    (u6,  'mia.zhang@example.com',        'Mia Zhang',        NULL, ST_SetSRID(ST_MakePoint(144.9700, -37.8200), 4326), 20, ARRAY['pokemon', 'mtg']::public.tcg_type[],            4.60, 15),
    (u7,  'noah.patel@example.com',       'Noah Patel',       NULL, ST_SetSRID(ST_MakePoint(144.9550, -37.8050), 4326), 25, ARRAY['mtg']::public.tcg_type[],                       4.30,  7),
    (u8,  'olivia.kim@example.com',       'Olivia Kim',       NULL, ST_SetSRID(ST_MakePoint(145.0100, -37.8300), 4326), 30, ARRAY['yugioh', 'pokemon']::public.tcg_type[],         4.75, 18),
    (u9,  'ethan.brooks@example.com',     'Ethan Brooks',     NULL, ST_SetSRID(ST_MakePoint(144.9800, -37.8400), 4326), 20, ARRAY['pokemon', 'mtg', 'yugioh']::public.tcg_type[],  4.10,  6),
    (u10, 'sophie.turner@example.com',    'Sophie Turner',    NULL, ST_SetSRID(ST_MakePoint(144.9450, -37.8150), 4326), 35, ARRAY['pokemon']::public.tcg_type[],                   4.85, 22),
    (u11, 'ryan.nakamura@example.com',    'Ryan Nakamura',    NULL, ST_SetSRID(ST_MakePoint(145.0500, -37.8700), 4326), 15, ARRAY['mtg', 'yugioh']::public.tcg_type[],             3.90,  4),
    (u12, 'chloe.anderson@example.com',   'Chloe Anderson',   NULL, ST_SetSRID(ST_MakePoint(144.9300, -37.7900), 4326), 25, ARRAY['pokemon']::public.tcg_type[],                   4.40,  9),
    (u13, 'daniel.lee@example.com',       'Daniel Lee',       NULL, ST_SetSRID(ST_MakePoint(145.0800, -37.8500), 4326), 20, ARRAY['yugioh']::public.tcg_type[],                    4.65, 14)
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
    total_trades = 7
  WHERE id = me;

  -- =========================================================================
  -- LISTINGS
  -- =========================================================================

  -- Current user's listings (6 total: 4 active, 1 matched, 1 completed)
  INSERT INTO public.listings (id, user_id, type, tcg, title, cash_amount, total_value, description, status, created_at)
  VALUES
    (my_l1, me, 'wts', 'pokemon', 'Charizard VMAX',                  42.00,  87.00, 'Perfect condition, sleeved immediately after pulling.',                     'active',    now() - interval '6 days'),
    (my_l2, me, 'wtb', 'yugioh',  'Dark Magician',                   20.00,  45.00, 'Looking for the original LOB art. LP or better.',                          'active',    now() - interval '5 days'),
    (my_l3, me, 'wtt', 'mtg',     'Force of Will',                    0.00,  85.00, 'Trading for dual lands or other Legacy staples.',                          'active',    now() - interval '4 days'),
    (my_l4, me, 'wts', 'pokemon', 'Pikachu VMAX',                    16.00,  34.50, 'Rainbow chonky boy. Mint condition.',                                      'matched',   now() - interval '12 days'),
    (my_l5, me, 'wts', 'pokemon', 'Evolving Skies Bundle',           85.00, 195.00, '3 chase cards from Evolving Skies. All NM, selling as a lot.',            'active',    now() - interval '2 days'),
    (my_l6, me, 'wtt', 'mtg',     'Modern Staples Bundle',            0.00, 120.00, 'Looking to swap my Modern cards for Pioneer or Legacy staples.',           'completed', now() - interval '30 days')
  ON CONFLICT (id) DO NOTHING;

  -- Original fake user listings (with extra listings per user)
  INSERT INTO public.listings (id, user_id, type, tcg, title, cash_amount, total_value, description, status, created_at)
  VALUES
    -- Alex Chen - Pokemon collector
    (u1_l1, u1, 'wts', 'pokemon', 'Umbreon VMAX Alt Art',             170.00, 350.00, 'Pristine alt art Umbreon. Centering is excellent.',                        'active', now() - interval '3 days'),
    (u1_l2, u1, 'wtb', 'pokemon', 'Charizard ex SAR',                  80.00, 175.00, 'Need this for my Charizard collection. NM only please.',                   'active', now() - interval '2 days'),
    (u1_l3, u1, 'wts', 'pokemon', 'Rayquaza VMAX Alt Art',            120.00, 245.00, 'Another beauty from Evolving Skies. PSA 9 candidate.',                    'active', now() - interval '1 day'),

    -- Sarah Mitchell - MTG player
    (u2_l1, u2, 'wts', 'mtg',     'Ragavan, Nimble Pilferer',          50.00, 105.00, 'Pack fresh Modern staple. Can meet at Good Games.',                        'active', now() - interval '4 days'),
    (u2_l2, u2, 'wtt', 'mtg',     'The One Ring',                       0.00,  65.00, 'Trading for Modern or Legacy staples. Prefer in-person.',                  'active', now() - interval '1 day'),
    (u2_l3, u2, 'wts', 'mtg',     'Atraxa, Grand Unifier',            28.00,  58.00, 'Standard all-star. Pack fresh from ONE.',                                  'active', now() - interval '6 hours'),

    -- James Wilson - Yu-Gi-Oh fan
    (u3_l1, u3, 'wts', 'yugioh',  'Blue-Eyes White Dragon',            35.00,  75.00, 'Classic BEWD from LOB. Light play, no creases.',                           'active', now() - interval '8 days'),
    (u3_l2, u3, 'wtt', 'yugioh',  'Ash Blossom & Joyous Spring',       0.00,  22.00, 'Trading for other hand traps or meta staples.',                            'active', now() - interval '6 days'),
    (u3_l3, u3, 'wts', 'yugioh',  'Starlight Rare Bundle',            200.00, 420.00, 'Two starlight rares in NM condition. Selling together only.',              'active', now() - interval '1 day'),

    -- Emma Rodriguez - Multi-TCG
    (u4_l1, u4, 'wts', 'pokemon', 'Mew VMAX Alt Art',                  50.00, 105.00, 'Beautiful alt art, freshly pulled. Sleeved and top-loaded.',               'active', now() - interval '2 days'),
    (u4_l2, u4, 'wts', 'mtg',     'Sheoldred, the Apocalypse',         70.00, 145.00, 'Standard powerhouse. Can meet anywhere in Melbourne.',                     'active', now() - interval '5 days'),
    (u4_l3, u4, 'wtt', 'pokemon', 'Full Art Trainer Collection',        0.00, 180.00, 'Trading my full art trainers for alt arts. 8 cards total.',                'active', now() - interval '3 days'),

    -- Liam O'Brien - Casual Pokemon
    (u5_l1, u5, 'wts', 'pokemon', 'Gengar VMAX Alt Art',               25.00,  53.00, 'Alt art Gengar. Prefer local trade at a card shop.',                       'active', now() - interval '1 day'),
    (u5_l2, u5, 'wtb', 'pokemon', 'Pikachu VMAX Rainbow',             180.00, 380.00, 'Chasing the rainbow Pikachu! Please help.',                               'active', now() - interval '3 days')
  ON CONFLICT (id) DO NOTHING;

  -- New user listings (filling out the discover feed)
  INSERT INTO public.listings (id, user_id, type, tcg, title, cash_amount, total_value, description, status, created_at)
  VALUES
    -- Mia Zhang - Pokemon/MTG
    (u6_l1, u6, 'wts', 'pokemon', 'Giratina VSTAR Alt Art',            65.00, 135.00, 'Lost Origin chase card. Pulled it myself, straight to sleeve.',            'active', now() - interval '1 day'),
    (u6_l2, u6, 'wtt', 'mtg',     'Liliana of the Veil',                0.00,  42.00, 'Trading for other Modern playables. DMU printing.',                        'active', now() - interval '3 days'),
    (u6_l3, u6, 'wtb', 'pokemon', 'Moonbreon Alt Art',                160.00, 330.00, 'Looking for NM Umbreon VMAX alt. Will pay well!',                         'active', now() - interval '5 hours'),

    -- Noah Patel - MTG focus
    (u7_l1, u7, 'wts', 'mtg',     'Wrenn and Six',                     55.00, 115.00, 'MH1 printing. Excellent condition, played in sleeves only.',               'active', now() - interval '2 days'),
    (u7_l2, u7, 'wts', 'mtg',     'Fetchland Bundle',                 120.00, 250.00, 'Set of 4 Scalding Tarns + 2 Misty Rainforests. All NM.',                  'active', now() - interval '4 days'),
    (u7_l3, u7, 'wtt', 'mtg',     'Doubling Season',                    0.00,  45.00, 'Trading for EDH staples. Foil Ravnica printing.',                          'active', now() - interval '8 hours'),

    -- Olivia Kim - Yu-Gi-Oh/Pokemon
    (u8_l1, u8, 'wts', 'yugioh',  'Accesscode Talker',                 18.00,  38.00, 'META staple. ETCO 1st ed. Clean corners.',                                 'active', now() - interval '1 day'),
    (u8_l2, u8, 'wts', 'pokemon', 'Lugia VSTAR Alt Art',               55.00, 115.00, 'Silver Tempest chase card. Gorgeous artwork.',                            'active', now() - interval '3 days'),
    (u8_l3, u8, 'wtt', 'yugioh',  'Ghost Rare Collection',              0.00, 280.00, '5 ghost rares from various sets. Trading as a lot for other ghosts.',     'active', now() - interval '6 days'),

    -- Ethan Brooks - All TCGs
    (u9_l1, u9, 'wts', 'pokemon', 'Scarlet & Violet Promos',           35.00,  72.00, 'Bundle of 6 SV promo cards including Pikachu ex.',                        'active', now() - interval '2 days'),
    (u9_l2, u9, 'wtt', 'mtg',     'Solitude',                           0.00,  32.00, 'MH2 pitch elemental. Trading for other MH2 mythics.',                     'active', now() - interval '4 days'),

    -- Sophie Turner - Pokemon collector (high volume)
    (u10_l1, u10, 'wts', 'pokemon', 'Palkia VSTAR Alt Art',             42.00,  88.00, 'Astral Radiance chase card. Pack fresh.',                                  'active', now() - interval '1 day'),
    (u10_l2, u10, 'wts', 'pokemon', 'Origin Forme Dialga VSTAR Alt',    35.00,  72.00, 'Beautiful alt art from Astral Radiance.',                                  'active', now() - interval '2 days'),
    (u10_l3, u10, 'wtb', 'pokemon', 'Charizard UPC Promo',             200.00, 420.00, 'Looking for the Ultra Premium Collection Charizard.',                     'active', now() - interval '3 days'),

    -- Ryan Nakamura - MTG/YuGiOh
    (u11_l1, u11, 'wts', 'mtg',     'Teferi, Time Raveler',             12.00,  25.00, 'WAR printing. Great condition, played in standard only.',                  'active', now() - interval '1 day'),
    (u11_l2, u11, 'wts', 'yugioh',  'Nibiru, the Primal Being',          8.00,  18.00, 'MAGO gold rare. Hand trap essential.',                                    'active', now() - interval '5 days'),

    -- Chloe Anderson - Pokemon sealed/singles
    (u12_l1, u12, 'wts', 'pokemon', 'Eeveelution Alt Art Bundle',      280.00, 580.00, 'All 3 Eeveelution VMAX alt arts from Evolving Skies!',                    'active', now() - interval '2 days'),
    (u12_l2, u12, 'wtt', 'pokemon', 'Radiant Collection',                0.00, 150.00, 'Full set of radiant cards from various sets. 12 cards.',                  'active', now() - interval '5 days'),
    (u12_l3, u12, 'wtb', 'pokemon', 'Crown Zenith Hits',                60.00, 125.00, 'Looking for Galarian Gallery cards from Crown Zenith.',                   'active', now() - interval '1 day'),

    -- Daniel Lee - Yu-Gi-Oh competitive
    (u13_l1, u13, 'wts', 'yugioh', 'Snake-Eyes Core',                   45.00,  95.00, 'Complete Snake-Eyes engine. All 1st ed, NM.',                              'active', now() - interval '1 day'),
    (u13_l2, u13, 'wtt', 'yugioh', 'Tearlaments Core',                   0.00,  85.00, 'Full Tearlaments deck core. Trading for Rescue-ACE.',                     'active', now() - interval '3 days'),
    (u13_l3, u13, 'wts', 'yugioh', 'Ash Blossom Starlight',             95.00, 195.00, 'Starlight rare Ash Blossom. Near mint, never played.',                    'active', now() - interval '7 hours')
  ON CONFLICT (id) DO NOTHING;

  -- =========================================================================
  -- LISTING ITEMS (card details for each listing)
  -- =========================================================================

  INSERT INTO public.listing_items (listing_id, card_name, card_image_url, card_external_id, tcg, card_set, card_number, card_rarity, condition, market_price, asking_price, quantity)
  VALUES
    -- Current user
    (my_l1, 'Charizard VMAX',              'https://images.pokemontcg.io/swsh3/20_hires.png',      'swsh3-20',  'pokemon', 'Darkness Ablaze',     '020/189', 'VMAX',             'nm', 45.00,  42.00, 1),
    (my_l2, 'Dark Magician',               'https://images.ygoprodeck.com/images/cards_small/46986414.jpg', 'LOB-005', 'yugioh', 'Legend of Blue Eyes', 'LOB-005', 'Ultra Rare', 'lp', 25.00, 20.00, 1),
    (my_l3, 'Force of Will',               'https://cards.scryfall.io/normal/front/9/a/9a879b60-4381-447d-8a5a-8e0b6a1d49ca.jpg', 'ALL-42', 'mtg', 'Alliances', '42', 'Uncommon', 'lp', 85.00, NULL, 1),
    (my_l4, 'Pikachu VMAX',                'https://images.pokemontcg.io/swsh4/44_hires.png',      'swsh4-44',  'pokemon', 'Vivid Voltage',       '044/185', 'VMAX',             'nm', 18.50,  16.00, 1),

    -- my_l5: Evolving Skies Bundle (3 items)
    (my_l5, 'Dragonite V Alt Art',          'https://images.pokemontcg.io/swsh7/203_hires.png',    'swsh7-203', 'pokemon', 'Evolving Skies',      '203/203', 'Secret Rare',      'nm', 45.00,  40.00, 1),
    (my_l5, 'Glaceon VMAX Alt Art',         'https://images.pokemontcg.io/swsh7/209_hires.png',    'swsh7-209', 'pokemon', 'Evolving Skies',      '209/203', 'Secret Rare',      'nm', 80.00,  70.00, 1),
    (my_l5, 'Leafeon VMAX Alt Art',         'https://images.pokemontcg.io/swsh7/205_hires.png',    'swsh7-205', 'pokemon', 'Evolving Skies',      '205/203', 'Secret Rare',      'nm', 70.00,  65.00, 1),

    -- my_l6: Modern Staples Bundle (2 items)
    (my_l6, 'Lightning Bolt',              'https://cards.scryfall.io/normal/front/f/2/f29ba16f-c8fb-42fe-aabf-87089cb214a7.jpg', 'A25-141', 'mtg', 'Masters 25', '141', 'Uncommon', 'nm', 3.00, NULL, 4),
    (my_l6, 'Path to Exile',               'https://cards.scryfall.io/normal/front/f/b/fbc09b16-2e8e-4ed2-8668-30f6d1510669.jpg', 'E01-17', 'mtg', 'Archenemy: Nicol Bolas', '17', 'Uncommon', 'nm', 4.00, NULL, 4),

    -- Alex Chen
    (u1_l1, 'Umbreon VMAX Alt Art',         'https://images.pokemontcg.io/swsh7/215_hires.png',    'swsh7-215', 'pokemon', 'Evolving Skies',      '215/203', 'Secret Rare',      'nm', 180.00, 170.00, 1),
    (u1_l2, 'Charizard ex SAR',             'https://images.pokemontcg.io/sv3/223.png',      'sv3-223',   'pokemon', 'Obsidian Flames',     '223/197', 'Special Art Rare', 'nm', 95.00,  80.00,  1),
    (u1_l3, 'Rayquaza VMAX Alt Art',        'https://images.pokemontcg.io/swsh7/218_hires.png',    'swsh7-218', 'pokemon', 'Evolving Skies',      '218/203', 'Secret Rare',      'nm', 125.00, 120.00, 1),

    -- Sarah Mitchell
    (u2_l1, 'Ragavan, Nimble Pilferer',     'https://cards.scryfall.io/normal/front/a/9/a9738cda-adb1-47fb-9f4c-ecd930228c4d.jpg', 'MH2-138', 'mtg', 'Modern Horizons 2', '138', 'Mythic Rare', 'nm', 55.00, 50.00, 1),
    (u2_l2, 'The One Ring',                 'https://cards.scryfall.io/normal/front/d/5/d5806e68-1054-458e-866d-1f2470f682b2.jpg', 'LTR-246', 'mtg', 'Tales of Middle-earth', '246', 'Mythic Rare', 'nm', 65.00, NULL, 1),
    (u2_l3, 'Atraxa, Grand Unifier',       'https://cards.scryfall.io/normal/front/4/a/4a1f905f-1d55-4d02-9d24-e58070f1b1d3.jpg', 'ONE-196', 'mtg', 'Phyrexia: All Will Be One', '196', 'Mythic Rare', 'nm', 30.00, 28.00, 1),

    -- James Wilson
    (u3_l1, 'Blue-Eyes White Dragon',       'https://images.ygoprodeck.com/images/cards_small/89631139.jpg', 'LOB-001', 'yugioh', 'Legend of Blue Eyes', 'LOB-001', 'Ultra Rare', 'lp', 40.00, 35.00, 1),
    (u3_l2, 'Ash Blossom & Joyous Spring',  'https://images.ygoprodeck.com/images/cards_small/14558127.jpg', 'MACR-036', 'yugioh', 'Maximum Crisis', 'MACR-036', 'Secret Rare', 'nm', 22.00, NULL, 1),
    -- u3_l3: Starlight Rare Bundle (2 items)
    (u3_l3, 'Accesscode Talker (Starlight)', 'https://images.ygoprodeck.com/images/cards_small/86066372.jpg', 'ETCO-099', 'yugioh', 'Eternity Code', 'ETCO-099', 'Starlight Rare', 'nm', 220.00, 200.00, 1),
    (u3_l3, 'Apollousa (Starlight)',         'https://images.ygoprodeck.com/images/cards_small/4280258.jpg',  'RIRA-097', 'yugioh', 'Rising Rampage', 'RIRA-097', 'Starlight Rare', 'nm', 200.00, 180.00, 1),

    -- Emma Rodriguez
    (u4_l1, 'Mew VMAX Alt Art',             'https://images.pokemontcg.io/swsh8/268_hires.png',    'swsh8-268', 'pokemon', 'Fusion Strike',        '268/264', 'Secret Rare',      'nm', 55.00,  50.00, 1),
    (u4_l2, 'Sheoldred, the Apocalypse',    'https://cards.scryfall.io/normal/front/d/6/d67be074-cdd4-41d9-ac89-0a0456c4e4b2.jpg', 'DMU-107', 'mtg', 'Dominaria United', '107', 'Mythic Rare', 'nm', 75.00, 70.00, 1),
    -- u4_l3: Full Art Trainer Collection (3 sample items)
    (u4_l3, 'Professor''s Research FA',      'https://images.pokemontcg.io/swsh1/209_hires.png',   'swsh1-209', 'pokemon', 'Sword & Shield',      '209/202', 'Full Art',         'nm', 18.00, NULL, 1),
    (u4_l3, 'Boss''s Orders FA',             'https://images.pokemontcg.io/swsh2/189_hires.png',   'swsh2-189', 'pokemon', 'Rebel Clash',          '189/192', 'Full Art',         'nm', 15.00, NULL, 1),
    (u4_l3, 'Marnie FA',                     'https://images.pokemontcg.io/swsh1/208_hires.png',   'swsh1-208', 'pokemon', 'Sword & Shield',      '208/202', 'Full Art',         'nm', 22.00, NULL, 1),

    -- Liam O'Brien
    (u5_l1, 'Gengar VMAX Alt Art',          'https://images.pokemontcg.io/swsh8/271_hires.png',    'swsh8-271', 'pokemon', 'Fusion Strike',        '271/264', 'Secret Rare',      'nm', 28.00,  25.00, 1),
    (u5_l2, 'Pikachu VMAX Rainbow',         'https://images.pokemontcg.io/swsh4/188_hires.png',    'swsh4-188', 'pokemon', 'Vivid Voltage',        '188/185', 'Secret Rare',      'nm', 200.00, 180.00, 1),

    -- Mia Zhang
    (u6_l1, 'Giratina VSTAR Alt Art',       'https://images.pokemontcg.io/swsh11/131_hires.png',   'swsh11-131','pokemon', 'Lost Origin',          '131/196', 'Secret Rare',      'nm', 70.00,  65.00, 1),
    (u6_l2, 'Liliana of the Veil',          'https://cards.scryfall.io/normal/front/d/1/d12c8c97-6491-452c-811d-943571a0d346.jpg', 'DMU-97', 'mtg', 'Dominaria United', '97', 'Mythic Rare', 'nm', 22.00, NULL, 1),
    (u6_l3, 'Umbreon VMAX Alt Art',         'https://images.pokemontcg.io/swsh7/215_hires.png',    'swsh7-215', 'pokemon', 'Evolving Skies',      '215/203', 'Secret Rare',      'nm', 180.00, 160.00, 1),

    -- Noah Patel
    (u7_l1, 'Wrenn and Six',                'https://cards.scryfall.io/normal/front/5/b/5bd498cc-a609-4457-9325-6888d59ca36f.jpg', 'MH1-217', 'mtg', 'Modern Horizons', '217', 'Mythic Rare', 'nm', 60.00, 55.00, 1),
    -- u7_l2: Fetchland Bundle (2 items)
    (u7_l2, 'Scalding Tarn',                'https://cards.scryfall.io/normal/front/7/1/71e491c5-8c07-449b-b2f1-ffa052f6d636.jpg', 'MH2-254', 'mtg', 'Modern Horizons 2', '254', 'Rare', 'nm', 28.00, 25.00, 4),
    (u7_l2, 'Misty Rainforest',             'https://cards.scryfall.io/normal/front/c/5/c5cd0d88-53b5-4560-bce0-910b3b7571a0.jpg', 'MH2-250', 'mtg', 'Modern Horizons 2', '250', 'Rare', 'nm', 22.00, 20.00, 2),
    (u7_l3, 'Doubling Season',              'https://cards.scryfall.io/normal/front/8/6/8676d164-c76e-402b-a649-6ded3f549b6e.jpg', 'RAV-158', 'mtg', 'Ravnica', '158', 'Rare', 'nm', 45.00, NULL, 1),

    -- Olivia Kim
    (u8_l1, 'Accesscode Talker',            'https://images.ygoprodeck.com/images/cards_small/86066372.jpg', 'ETCO-086', 'yugioh', 'Eternity Code', 'ETCO-086', 'Ultra Rare', 'nm', 20.00, 18.00, 1),
    (u8_l2, 'Lugia VSTAR Alt Art',          'https://images.pokemontcg.io/swsh12pt5/186_hires.png', 'swsh12pt5-186', 'pokemon', 'Silver Tempest', '186/195', 'Secret Rare', 'nm', 60.00, 55.00, 1),
    -- u8_l3: Ghost Rare Collection (3 items)
    (u8_l3, 'Stardust Dragon (Ghost)',       'https://images.ygoprodeck.com/images/cards_small/44508094.jpg', 'TDGS-040', 'yugioh', 'The Duelist Genesis', 'TDGS-040', 'Ghost Rare', 'lp', 85.00, NULL, 1),
    (u8_l3, 'Rainbow Dragon (Ghost)',        'https://images.ygoprodeck.com/images/cards_small/95744531.jpg', 'TAEV-098', 'yugioh', 'Tactical Evolution', 'TAEV-098', 'Ghost Rare', 'lp', 95.00, NULL, 1),
    (u8_l3, 'Galaxy-Eyes Photon Dragon (Ghost)', 'https://images.ygoprodeck.com/images/cards_small/56713552.jpg', 'GAOV-098', 'yugioh', 'Galactic Overlord', 'GAOV-098', 'Ghost Rare', 'nm', 100.00, NULL, 1),

    -- Ethan Brooks
    -- u9_l1: SV Promos Bundle (3 items)
    (u9_l1, 'Pikachu ex Promo',             'https://images.pokemontcg.io/svp/39_hires.png',       'svp-39',    'pokemon', 'Scarlet & Violet Promos', '039', 'Promo', 'nm', 15.00, 12.00, 1),
    (u9_l1, 'Mewtwo ex Promo',              'https://images.pokemontcg.io/svp/30_hires.png',       'svp-30',    'pokemon', 'Scarlet & Violet Promos', '030', 'Promo', 'nm', 12.00, 10.00, 1),
    (u9_l1, 'Charizard ex Promo',           'https://images.pokemontcg.io/svp/29_hires.png',       'svp-29',    'pokemon', 'Scarlet & Violet Promos', '029', 'Promo', 'nm', 18.00, 15.00, 1),
    (u9_l2, 'Solitude',                     'https://cards.scryfall.io/normal/front/4/7/47a6234f-309f-4e03-9263-66da48b57153.jpg', 'MH2-32', 'mtg', 'Modern Horizons 2', '32', 'Mythic Rare', 'nm', 35.00, NULL, 1),

    -- Sophie Turner
    (u10_l1, 'Palkia VSTAR Alt Art',         'https://images.pokemontcg.io/swsh10/195_hires.png',  'swsh10-195', 'pokemon', 'Astral Radiance',      '195/189', 'Secret Rare',     'nm', 45.00, 42.00, 1),
    (u10_l2, 'Origin Forme Dialga VSTAR Alt','https://images.pokemontcg.io/swsh10/196_hires.png',  'swsh10-196', 'pokemon', 'Astral Radiance',      '196/189', 'Secret Rare',     'nm', 38.00, 35.00, 1),
    (u10_l3, 'Charizard UPC Promo',          'https://images.pokemontcg.io/swsh12pt5gg/GG70_hires.png', 'swsh12pt5gg-GG70', 'pokemon', 'Crown Zenith GG', 'GG70', 'Special Art Rare', 'nm', 210.00, 200.00, 1),

    -- Ryan Nakamura
    (u11_l1, 'Teferi, Time Raveler',         'https://cards.scryfall.io/normal/front/5/c/5cb76266-ae50-4bbc-8f96-d98f309b02d3.jpg', 'WAR-221', 'mtg', 'War of the Spark', '221', 'Rare', 'nm', 14.00, 12.00, 1),
    (u11_l2, 'Nibiru, the Primal Being',     'https://images.ygoprodeck.com/images/cards_small/27204311.jpg', 'MAGO-026', 'yugioh', 'Maximum Gold', 'MAGO-026', 'Premium Gold Rare', 'nm', 10.00, 8.00, 1),

    -- Chloe Anderson
    -- u12_l1: Eeveelution Bundle (3 items)
    (u12_l1, 'Umbreon VMAX Alt Art',         'https://images.pokemontcg.io/swsh7/215_hires.png',   'swsh7-215', 'pokemon', 'Evolving Skies',      '215/203', 'Secret Rare',      'nm', 180.00, 170.00, 1),
    (u12_l1, 'Glaceon VMAX Alt Art',         'https://images.pokemontcg.io/swsh7/209_hires.png',   'swsh7-209', 'pokemon', 'Evolving Skies',      '209/203', 'Secret Rare',      'nm', 80.00,  75.00,  1),
    (u12_l1, 'Espeon VMAX Alt Art',          'https://images.pokemontcg.io/swsh7/270_hires.png',   'swsh7-270', 'pokemon', 'Evolving Skies',      '270/203', 'Secret Rare',      'nm', 65.00,  60.00,  1),
    -- u12_l2: Radiant Collection (3 sample items)
    (u12_l2, 'Radiant Charizard',            'https://images.pokemontcg.io/pgo/11_hires.png',      'pgo-11',    'pokemon', 'Pokemon GO',           '011/078', 'Radiant Rare',     'nm', 12.00, NULL, 1),
    (u12_l2, 'Radiant Blastoise',            'https://images.pokemontcg.io/pgo/18_hires.png',      'pgo-18',    'pokemon', 'Pokemon GO',           '018/078', 'Radiant Rare',     'nm', 6.00,  NULL, 1),
    (u12_l2, 'Radiant Greninja',             'https://images.pokemontcg.io/swsh10/46_hires.png',   'swsh10-46', 'pokemon', 'Astral Radiance',      '046/189', 'Radiant Rare',     'nm', 5.00,  NULL, 1),
    (u12_l3, 'Galarian Gallery Hits',        'https://images.pokemontcg.io/swsh12pt5gg/GG70_hires.png', 'swsh12pt5gg-GG70', 'pokemon', 'Crown Zenith GG', 'GG70', 'Special Art Rare', 'nm', 65.00, 60.00, 1),

    -- Daniel Lee
    -- u13_l1: Snake-Eyes Core (2 items)
    (u13_l1, 'Snake-Eye Ash',                'https://images.ygoprodeck.com/images/cards_small/96451900.jpg', 'AGOV-088', 'yugioh', 'Age of Overlord', 'AGOV-088', 'Super Rare', 'nm', 25.00, 22.00, 3),
    (u13_l1, 'Snake-Eyes Flamberge Dragon',  'https://images.ygoprodeck.com/images/cards_small/71646338.jpg', 'PHNI-099', 'yugioh', 'Phantom Nightmare', 'PHNI-099', 'Ultra Rare', 'nm', 20.00, 18.00, 1),
    -- u13_l2: Tearlaments Core (2 items)
    (u13_l2, 'Tearlaments Kitkallos',        'https://images.ygoprodeck.com/images/cards_small/92731385.jpg', 'POTE-048', 'yugioh', 'Power of the Elements', 'POTE-048', 'Ultra Rare', 'nm', 30.00, NULL, 1),
    (u13_l2, 'Tearlaments Rulkallos',        'https://images.ygoprodeck.com/images/cards_small/84330567.jpg', 'POTE-047', 'yugioh', 'Power of the Elements', 'POTE-047', 'Ultra Rare', 'nm', 18.00, NULL, 1),
    (u13_l3, 'Ash Blossom (Starlight)',      'https://images.ygoprodeck.com/images/cards_small/14558127.jpg', 'DUNE-100', 'yugioh', 'Duelist Nexus', 'DUNE-100', 'Starlight Rare', 'nm', 100.00, 95.00, 1)
  ON CONFLICT DO NOTHING;

  -- =========================================================================
  -- OFFERS
  -- =========================================================================
  INSERT INTO public.offers (id, listing_id, offerer_id, status, cash_amount, message, created_at)
  VALUES
    -- Accepted offers (lead to matches)
    (offer_1, my_l1, u1,  'accepted',  80.00, 'I have the Charizard ex SAR you want! Straight swap?',               now() - interval '5 days'),
    (offer_2, my_l3, u2,  'accepted',   0.00, 'Will trade my One Ring for your Force of Will.',                     now() - interval '3 days'),
    (offer_3, my_l2, u3,  'accepted',  35.00, 'I have a LOB Dark Magician for you!',                                now() - interval '14 days'),
    (offer_4, my_l4, u4,  'accepted',  50.00, 'Interested in your Pikachu VMAX.',                                   now() - interval '10 days'),
    (offer_5, my_l5, u6,  'accepted',  80.00, 'I want the Evolving Skies bundle! Great price.',                     now() - interval '1 day'),
    (offer_6, my_l6, u7,  'accepted',   0.00, 'Happy to trade my fetchlands for your Modern staples.',              now() - interval '28 days'),

    -- Pending offers (show as pending on listings)
    (offer_7, my_l1, u10, 'pending',   40.00, 'Would you take $40 for the Charizard VMAX?',                         now() - interval '2 days'),
    (offer_8, my_l1, u12, 'pending',   38.00, 'Interested! Would you do $38 plus shipping?',                        now() - interval '1 day'),
    (offer_9, my_l3, u9,  'pending',    0.00, 'I have a Solitude I could trade for the Force of Will.',             now() - interval '1 day'),
    (offer_10, my_l5, u8, 'pending',   75.00, 'Would you take $75 for the Evolving Skies bundle?',                  now() - interval '8 hours')
  ON CONFLICT (id) DO NOTHING;

  -- =========================================================================
  -- OFFER ITEMS (items included in offers)
  -- =========================================================================
  INSERT INTO public.offer_items (offer_id, card_name, card_image_url, card_external_id, tcg, card_set, card_number, condition, market_price, quantity)
  VALUES
    -- Offer 1: Alex trading Charizard ex SAR
    (offer_1, 'Charizard ex SAR', 'https://images.pokemontcg.io/sv3/223.png', 'sv3-223', 'pokemon', 'Obsidian Flames', '223/197', 'nm', 95.00, 1),
    -- Offer 2: Sarah trading The One Ring
    (offer_2, 'The One Ring', 'https://cards.scryfall.io/normal/front/d/5/d5806e68-1054-458e-866d-1f2470f682b2.jpg', 'LTR-246', 'mtg', 'Tales of Middle-earth', '246', 'nm', 65.00, 1),
    -- Offer 9: Ethan trading Solitude
    (offer_9, 'Solitude', 'https://cards.scryfall.io/normal/front/4/7/47a6234f-309f-4e03-9263-66da48b57153.jpg', 'MH2-32', 'mtg', 'Modern Horizons 2', '32', 'nm', 35.00, 1)
  ON CONFLICT DO NOTHING;

  -- =========================================================================
  -- MATCHES (6 matches, various statuses)
  -- =========================================================================
  INSERT INTO public.matches (id, user_a_id, user_b_id, listing_id, offer_id, status, created_at)
  VALUES
    (match_1, me, u1, my_l1, offer_1, 'active',    now() - interval '5 days'),
    (match_2, me, u2, my_l3, offer_2, 'active',    now() - interval '3 days'),
    (match_3, me, u3, my_l2, offer_3, 'completed', now() - interval '14 days'),
    (match_4, me, u4, my_l4, offer_4, 'completed', now() - interval '10 days'),
    (match_5, me, u6, my_l5, offer_5, 'active',    now() - interval '1 day'),
    (match_6, me, u7, my_l6, offer_6, 'completed', now() - interval '28 days')
  ON CONFLICT (id) DO NOTHING;

  -- =========================================================================
  -- CONVERSATIONS (1 per match)
  -- =========================================================================
  INSERT INTO public.conversations (id, match_id, created_at)
  VALUES
    (conv_1, match_1, now() - interval '5 days'),
    (conv_2, match_2, now() - interval '3 days'),
    (conv_3, match_3, now() - interval '14 days'),
    (conv_4, match_4, now() - interval '10 days'),
    (conv_5, match_5, now() - interval '1 day'),
    (conv_6, match_6, now() - interval '28 days')
  ON CONFLICT (id) DO NOTHING;

  -- =========================================================================
  -- MESSAGES (varied types: text, card_offer, meetup_proposal)
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
    (msg_06, conv_1, me, 'text', 'Perfect, I will be there! See you Saturday.', NULL, now() - interval '4 days 14 hours'),

    -- Conv 2: me + Sarah Mitchell (MTG, active match)
    (msg_07, conv_2, me, 'text', 'Hi Sarah! Interested in trading my Force of Will for your The One Ring?', NULL, now() - interval '3 days'),
    (msg_08, conv_2, u2, 'text', 'Hey! Yeah I would be down for that. Force of Will is one of my favourite cards.', NULL, now() - interval '2 days 22 hours'),
    (msg_09, conv_2, u2, 'card_offer', NULL,
      jsonb_build_object(
        'offering', jsonb_build_array(
          jsonb_build_object('externalId', 'LTR-246', 'tcg', 'mtg', 'name', 'The One Ring', 'imageUrl', 'https://cards.scryfall.io/normal/front/d/5/d5806e68-1054-458e-866d-1f2470f682b2.jpg', 'condition', 'nm', 'quantity', 1)
        ),
        'requesting', jsonb_build_array(
          jsonb_build_object('externalId', 'ALL-42', 'tcg', 'mtg', 'name', 'Force of Will', 'imageUrl', 'https://cards.scryfall.io/normal/front/9/a/9a879b60-4381-447d-8a5a-8e0b6a1d49ca.jpg', 'condition', 'lp', 'quantity', 1)
        ),
        'cash_amount', 10,
        'cash_direction', 'offering',
        'note', 'I can add $10 since Force of Will is worth a bit more. Fair?'
      ),
      now() - interval '2 days 20 hours'),
    (msg_10, conv_2, me, 'text', 'That is a really fair offer! I accept. Want to meet at a shop?', NULL, now() - interval '2 days 18 hours'),
    (msg_11, conv_2, u2, 'meetup_proposal', 'Cardtastic TCG on Sunday at 1pm?',
      jsonb_build_object('shop_id', shop_cardtastic, 'location_name', 'Cardtastic TCG', 'proposed_time', (now() + interval '3 days')::text),
      now() - interval '2 days 16 hours'),

    -- Conv 3: me + James Wilson (YuGiOh, completed)
    (msg_12, conv_3, u3, 'text', 'Hey, saw you are looking for Dark Magician LOB. I have one!', NULL, now() - interval '14 days'),
    (msg_13, conv_3, me, 'text', 'Awesome! What condition is it in?', NULL, now() - interval '13 days 22 hours'),
    (msg_14, conv_3, u3, 'text', 'Light play, edges are clean. I can do $35 for it.', NULL, now() - interval '13 days 20 hours'),
    (msg_15, conv_3, me, 'text', 'Deal! When can we meet?', NULL, now() - interval '13 days 18 hours'),
    (msg_16, conv_3, u3, 'meetup_proposal', 'Games Laboratory, Friday at 5pm?',
      jsonb_build_object('shop_id', shop_games_lab, 'location_name', 'Games Laboratory', 'proposed_time', (now() - interval '7 days')::text),
      now() - interval '13 days'),
    (msg_17, conv_3, me, 'text', 'Sounds good! See you there.', NULL, now() - interval '12 days 22 hours'),
    (msg_18, conv_3, u3, 'text', 'Great trade! Thanks for the smooth transaction.', NULL, now() - interval '7 days'),

    -- Conv 4: me + Emma Rodriguez (Pokemon, completed)
    (msg_19, conv_4, u4, 'text', 'Your Pikachu VMAX is exactly what I need! Want to trade for my Mew VMAX Alt Art?', NULL, now() - interval '10 days'),
    (msg_20, conv_4, me, 'text', 'That sounds like a great trade! Let us meet at General Games Malvern.', NULL, now() - interval '9 days 22 hours'),
    (msg_21, conv_4, u4, 'card_offer', NULL,
      jsonb_build_object(
        'offering', jsonb_build_array(
          jsonb_build_object('externalId', 'swsh8-268', 'tcg', 'pokemon', 'name', 'Mew VMAX Alt Art', 'imageUrl', 'https://images.pokemontcg.io/swsh8/268_hires.png', 'condition', 'nm', 'quantity', 1)
        ),
        'requesting', jsonb_build_array(
          jsonb_build_object('externalId', 'swsh4-44', 'tcg', 'pokemon', 'name', 'Pikachu VMAX', 'imageUrl', 'https://images.pokemontcg.io/swsh4/44_hires.png', 'condition', 'nm', 'quantity', 1)
        ),
        'note', 'Straight swap? Mew for Pikachu VMAX.'
      ),
      now() - interval '9 days 20 hours'),
    (msg_22, conv_4, me, 'card_offer_response', 'Accepted!',
      jsonb_build_object('offer_message_id', msg_21::text, 'action', 'accepted'),
      now() - interval '9 days 18 hours'),
    (msg_23, conv_4, u4, 'meetup_proposal', 'General Games Malvern, Tuesday at 4pm?',
      jsonb_build_object('shop_id', shop_general, 'location_name', 'General Games Malvern', 'proposed_time', (now() - interval '8 days')::text),
      now() - interval '9 days 16 hours'),
    (msg_24, conv_4, me, 'text', 'Perfect! See you there.', NULL, now() - interval '9 days 14 hours'),
    (msg_25, conv_4, u4, 'text', 'The Pikachu VMAX is gorgeous! Thanks for the trade.', NULL, now() - interval '8 days'),

    -- Conv 5: me + Mia Zhang (Pokemon bundle, active)
    (msg_26, conv_5, u6, 'text', 'Hi! I love your Evolving Skies bundle. Great price for all three!', NULL, now() - interval '1 day'),
    (msg_27, conv_5, me, 'text', 'Thanks! They are all in NM condition, pulled them myself.', NULL, now() - interval '23 hours'),
    (msg_28, conv_5, u6, 'text', 'Amazing. Can we meet this week? I am near Melbourne CBD.', NULL, now() - interval '20 hours'),
    (msg_29, conv_5, me, 'text', 'For sure! How about Cherry Collectables? It is close to the city.', NULL, now() - interval '18 hours'),
    (msg_30, conv_5, u6, 'meetup_proposal', 'Cherry Collectables, Wednesday at 12pm?',
      jsonb_build_object('shop_id', shop_cherry, 'location_name', 'Cherry Collectables', 'proposed_time', (now() + interval '1 day')::text),
      now() - interval '16 hours'),

    -- Conv 6: me + Noah Patel (MTG, completed)
    (msg_31, conv_6, u7, 'text', 'Hey, saw your Modern staples. Want to swap for my fetchland bundle?', NULL, now() - interval '28 days'),
    (msg_32, conv_6, me, 'text', 'Sounds great! Those Scalding Tarns are exactly what I need.', NULL, now() - interval '27 days 22 hours')
  ON CONFLICT (id) DO NOTHING;

  -- =========================================================================
  -- MEETUPS (6 total: 3 upcoming, 3 completed)
  -- =========================================================================
  INSERT INTO public.meetups (id, match_id, proposal_message_id, shop_id, location_name, proposed_time, status, user_a_completed, user_b_completed, created_at)
  VALUES
    -- Upcoming
    (meetup_1, match_1, msg_05, shop_good_games, 'Good Games Melbourne',   now() + interval '2 days',   'confirmed', false, false, now() - interval '4 days 16 hours'),
    (meetup_2, match_2, msg_11, shop_cardtastic, 'Cardtastic TCG',         now() + interval '3 days',   'confirmed', false, false, now() - interval '2 days 16 hours'),
    (meetup_5, match_5, msg_30, shop_cherry,     'Cherry Collectables',    now() + interval '1 day',    'confirmed', false, false, now() - interval '16 hours'),
    -- Past completed
    (meetup_3, match_3, msg_16, shop_games_lab,  'Games Laboratory',       now() - interval '7 days',   'completed', true,  true,  now() - interval '13 days'),
    (meetup_4, match_4, msg_23, shop_general,    'General Games Malvern',  now() - interval '8 days',   'completed', true,  true,  now() - interval '9 days 16 hours'),
    (meetup_6, match_6, msg_32, shop_hobbymaster,'Hobbymaster Doncaster',  now() - interval '25 days',  'completed', true,  true,  now() - interval '27 days')
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
    (meetup_4, me, u4, 5, 'Amazing trader! The Mew VMAX is gorgeous. Highly recommended.',     now() - interval '7 days'),
    -- Meetup 6: me <-> Noah
    (meetup_6, u7, me, 5, 'Brady is an excellent trader. Cards were all NM as described.',     now() - interval '24 days'),
    (meetup_6, me, u7, 5, 'Noah brought perfect fetchlands. Highly recommend trading!',        now() - interval '24 days')
  ON CONFLICT DO NOTHING;

  -- =========================================================================
  -- SWIPES (Brady has swiped on some listings)
  -- =========================================================================
  INSERT INTO public.swipes (user_id, listing_id, direction, created_at)
  VALUES
    -- Likes (interested)
    (me, u1_l1, 'like', now() - interval '4 days'),
    (me, u2_l1, 'like', now() - interval '3 days'),
    (me, u4_l1, 'like', now() - interval '2 days'),
    (me, u6_l1, 'like', now() - interval '1 day'),
    (me, u8_l2, 'like', now() - interval '12 hours'),
    (me, u10_l1, 'like', now() - interval '6 hours'),
    -- Passes
    (me, u5_l2, 'pass', now() - interval '3 days'),
    (me, u11_l2, 'pass', now() - interval '2 days'),
    (me, u3_l1, 'pass', now() - interval '1 day')
  ON CONFLICT DO NOTHING;

  -- =========================================================================
  -- COLLECTION ITEMS (expanded for current user)
  -- =========================================================================

  -- Regular cards
  INSERT INTO public.collection_items (user_id, tcg, external_id, card_name, set_name, set_code, card_number, image_url, rarity, condition, quantity, is_wishlist, market_price, grading_company, grading_score, is_sealed, product_type, purchase_price)
  VALUES
    -- Pokemon
    (me, 'pokemon', 'swsh3-20',   'Charizard VMAX',         'Darkness Ablaze',   'swsh3',  '020/189', 'https://images.pokemontcg.io/swsh3/20_hires.png',   'VMAX',             'nm', 1, false, 45.00,  NULL,  NULL,  false, NULL, NULL),
    (me, 'pokemon', 'swsh3-20',   'Charizard VMAX',         'Darkness Ablaze',   'swsh3',  '020/189', 'https://images.pokemontcg.io/swsh3/20_hires.png',   'VMAX',             'lp', 1, false, 42.00,  NULL,  NULL,  false, NULL, 40.00),
    (me, 'pokemon', 'swsh7-215',  'Umbreon VMAX Alt Art',   'Evolving Skies',    'swsh7',  '215/203', 'https://images.pokemontcg.io/swsh7/215_hires.png',  'Secret Rare',      'nm', 1, false, 180.00, 'psa', '10',  false, NULL, NULL),
    (me, 'pokemon', 'sv3-223',    'Charizard ex SAR',       'Obsidian Flames',   'sv3',    '223/197', 'https://images.pokemontcg.io/sv3/223.png',    'Special Art Rare', 'nm', 1, false, 95.00,  NULL,  NULL,  false, NULL, NULL),
    (me, 'pokemon', 'swsh4-44',   'Pikachu VMAX',           'Vivid Voltage',     'swsh4',  '044/185', 'https://images.pokemontcg.io/swsh4/44_hires.png',   'VMAX',             'lp', 1, false, 18.50,  NULL,  NULL,  false, NULL, NULL),
    (me, 'pokemon', 'swsh8-268',  'Mew VMAX Alt Art',       'Fusion Strike',     'swsh8',  '268/264', 'https://images.pokemontcg.io/swsh8/268_hires.png',  'Secret Rare',      'nm', 1, false, 55.00,  'cgc', '9.5', false, NULL, NULL),
    (me, 'pokemon', 'swsh7-203',  'Dragonite V Alt Art',    'Evolving Skies',    'swsh7',  '203/203', 'https://images.pokemontcg.io/swsh7/203_hires.png',  'Secret Rare',      'nm', 1, false, 45.00,  NULL,  NULL,  false, NULL, 38.00),
    (me, 'pokemon', 'swsh7-218',  'Rayquaza VMAX Alt Art',  'Evolving Skies',    'swsh7',  '218/203', 'https://images.pokemontcg.io/swsh7/218_hires.png',  'Secret Rare',      'nm', 1, false, 125.00, 'psa', '9',   false, NULL, 110.00),
    (me, 'pokemon', 'swsh11-131', 'Giratina VSTAR Alt Art', 'Lost Origin',       'swsh11', '131/196', 'https://images.pokemontcg.io/swsh11/131_hires.png', 'Secret Rare',      'nm', 1, false, 70.00,  NULL,  NULL,  false, NULL, 55.00),
    (me, 'pokemon', 'swsh8-271',  'Gengar VMAX Alt Art',    'Fusion Strike',     'swsh8',  '271/264', 'https://images.pokemontcg.io/swsh8/271_hires.png',  'Secret Rare',      'lp', 1, false, 25.00,  NULL,  NULL,  false, NULL, 20.00),
    (me, 'pokemon', 'pgo-11',     'Radiant Charizard',      'Pokemon GO',        'pgo',    '011/078', 'https://images.pokemontcg.io/pgo/11_hires.png',     'Radiant Rare',     'nm', 1, false, 12.00,  NULL,  NULL,  false, NULL, 8.00),
    (me, 'pokemon', 'swsh10-195', 'Palkia VSTAR Alt Art',   'Astral Radiance',   'swsh10', '195/189', 'https://images.pokemontcg.io/swsh10/195_hires.png', 'Secret Rare',      'nm', 1, false, 45.00,  NULL,  NULL,  false, NULL, 35.00),

    -- MTG
    (me, 'mtg', 'MH2-138', 'Ragavan, Nimble Pilferer',  'Modern Horizons 2',    'MH2', '138', 'https://cards.scryfall.io/normal/front/a/9/a9738cda-adb1-47fb-9f4c-ecd930228c4d.jpg', 'Mythic Rare', 'nm', 1, false, 55.00,  NULL,  NULL,  false, NULL, NULL),
    (me, 'mtg', 'MH2-138', 'Ragavan, Nimble Pilferer',  'Modern Horizons 2',    'MH2', '138', 'https://cards.scryfall.io/normal/front/a/9/a9738cda-adb1-47fb-9f4c-ecd930228c4d.jpg', 'Mythic Rare', 'nm', 1, false, 60.00,  'psa', '9',   false, NULL, 50.00),
    (me, 'mtg', 'ALL-42',  'Force of Will',             'Alliances',            'ALL', '42',  'https://cards.scryfall.io/normal/front/9/a/9a879b60-4381-447d-8a5a-8e0b6a1d49ca.jpg', 'Uncommon',    'lp', 1, false, 85.00,  NULL,  NULL,  false, NULL, NULL),
    (me, 'mtg', 'MH2-254', 'Scalding Tarn',             'Modern Horizons 2',    'MH2', '254', 'https://cards.scryfall.io/normal/front/7/1/71e491c5-8c07-449b-b2f1-ffa052f6d636.jpg', 'Rare',        'nm', 1, false, 28.00,  NULL,  NULL,  false, NULL, 22.00),
    (me, 'mtg', 'MH2-254', 'Scalding Tarn',             'Modern Horizons 2',    'MH2', '254', 'https://cards.scryfall.io/normal/front/7/1/71e491c5-8c07-449b-b2f1-ffa052f6d636.jpg', 'Rare',        'nm', 1, false, 28.00,  NULL,  NULL,  false, NULL, 22.00),
    (me, 'mtg', 'DMU-107', 'Sheoldred, the Apocalypse', 'Dominaria United',     'DMU', '107', 'https://cards.scryfall.io/normal/front/d/6/d67be074-cdd4-41d9-ac89-0a0456c4e4b2.jpg', 'Mythic Rare', 'nm', 1, false, 75.00,  NULL,  NULL,  false, NULL, 60.00),

    -- Yu-Gi-Oh
    (me, 'yugioh', 'LOB-005',   'Dark Magician',                'Legend of Blue Eyes', 'LOB',  '005',  'https://images.ygoprodeck.com/images/cards_small/46986414.jpg', 'Ultra Rare',    'mp', 1, false, 25.00, NULL, NULL, false, NULL, NULL),
    (me, 'yugioh', 'LOB-001',   'Blue-Eyes White Dragon',       'Legend of Blue Eyes', 'LOB',  '001',  'https://images.ygoprodeck.com/images/cards_small/89631139.jpg', 'Ultra Rare',    'hp', 1, false, 20.00, NULL, NULL, false, NULL, 15.00),
    (me, 'yugioh', 'MACR-036',  'Ash Blossom & Joyous Spring',  'Maximum Crisis',     'MACR', '036',  'https://images.ygoprodeck.com/images/cards_small/14558127.jpg', 'Secret Rare',   'nm', 1, false, 22.00, NULL, NULL, false, NULL, 18.00)
  ON CONFLICT DO NOTHING;

  -- Wishlist items
  INSERT INTO public.collection_items (user_id, tcg, external_id, card_name, set_name, set_code, card_number, image_url, rarity, condition, quantity, is_wishlist, market_price, is_sealed, product_type, purchase_price)
  VALUES
    (me, 'pokemon', 'swsh4-188',       'Pikachu VMAX Rainbow',    'Vivid Voltage',           'swsh4',       '188/185', 'https://images.pokemontcg.io/swsh4/188_hires.png',  'Secret Rare', 'nm', 1, true, 200.00, false, NULL, NULL),
    (me, 'mtg',     'LTR-246',         'The One Ring',            'Tales of Middle-earth',   'LTR',         '246',     'https://cards.scryfall.io/normal/front/d/5/d5806e68-1054-458e-866d-1f2470f682b2.jpg', 'Mythic Rare', 'nm', 1, true, 65.00, false, NULL, NULL),
    (me, 'pokemon', 'swsh7-209',       'Glaceon VMAX Alt Art',    'Evolving Skies',          'swsh7',       '209/203', 'https://images.pokemontcg.io/swsh7/209_hires.png',  'Secret Rare', 'nm', 1, true, 80.00,  false, NULL, NULL),
    (me, 'yugioh',  'DUNE-100',        'Ash Blossom (Starlight)', 'Duelist Nexus',           'DUNE',        '100',     'https://images.ygoprodeck.com/images/cards_small/14558127.jpg', 'Starlight Rare', 'nm', 1, true, 100.00, false, NULL, NULL)
  ON CONFLICT DO NOTHING;

  -- Sealed products
  INSERT INTO public.collection_items (user_id, tcg, external_id, card_name, set_name, set_code, card_number, image_url, condition, quantity, is_wishlist, is_sealed, product_type, purchase_price, market_price)
  VALUES
    (me, 'pokemon', 'sealed-sv3-bb',    'Obsidian Flames Booster Box',       'Obsidian Flames',  'sv3',   '', '', 'nm', 1, false, true, 'booster_box',  145.00, 165.00),
    (me, 'pokemon', 'sealed-swsh7-etb', 'Evolving Skies Elite Trainer Box',  'Evolving Skies',   'swsh7', '', '', 'nm', 2, false, true, 'etb',           55.00,  75.00),
    (me, 'pokemon', 'sealed-sv1-bb',    'Scarlet & Violet Booster Box',      'Scarlet & Violet', 'sv1',   '', '', 'nm', 1, false, true, 'booster_box',  140.00, 155.00),
    (me, 'pokemon', 'sealed-swsh12-etb','Crown Zenith Elite Trainer Box',    'Crown Zenith',     'swsh12pt5', '', '', 'nm', 1, false, true, 'etb',       50.00,  65.00),
    (me, 'mtg',     'sealed-mh2-bb',    'Modern Horizons 2 Draft Booster Box','Modern Horizons 2','MH2',  '', '', 'nm', 1, false, true, 'booster_box',  280.00, 320.00)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed data inserted successfully for user %', me;
END $$;
