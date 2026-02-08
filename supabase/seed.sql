-- =============================================================================
-- TCG Trade Hub - Seed Data
-- Card shops in Melbourne, Australia
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
