CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Ensure Table Exists Safeguard
CREATE TABLE IF NOT EXISTS public.interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert Interests Taxonomy
INSERT INTO public.interests (id, name, category, description) VALUES
    ('11111111-0000-0000-0000-000000000001', 'Artificial Intelligence', 'Technology', 'Machine learning, neural networks, LLMs, and intelligent agents'),
    ('11111111-0000-0000-0000-000000000002', 'Coding & Hackathons', 'Technology', 'Competitive programming, full-stack web, mobile apps, hackathons'),
    ('11111111-0000-0000-0000-000000000003', 'Robotics & Hardware', 'Technology', 'Arduino, ESP32, microcontrollers, IoT, autonomous bots, drones'),
    ('11111111-0000-0000-0000-000000000004', 'Gaming & Esports', 'Technology', 'Competitive esports (Valorant, BGMI, CS), LAN parties, indie game dev'),
    ('11111111-0000-0000-0000-000000000005', 'Photography & Framing', 'Creative', 'Street photography, camera gear, portraiture, Lightroom editing'),
    ('11111111-0000-0000-0000-000000000006', 'Content Creation & Reels', 'Creative', 'Short-form video, video editing (Premiere/CapCut), storytelling, social media'),
    ('11111111-0000-0000-0000-000000000007', 'UI/UX & Visual Design', 'Creative', 'Figma, digital illustration, branding, product design, posters'),
    ('11111111-0000-0000-0000-000000000008', 'Classical & Folk Dance', 'Performing Arts', 'Kathak, Bharatanatyam, Garba, stage choreography, hosting'),
    ('11111111-0000-0000-0000-000000000009', 'Acoustic Guitar & Vocals', 'Performing Arts', 'Gentle unplugged jams, singing, songwriting, indie music, open mics'),
    ('11111111-0000-0000-0000-000000000010', 'Street Theater & Nukkad Natak', 'Performing Arts', 'High-energy social drama, acting, scriptwriting, voice modulation'),
    ('11111111-0000-0000-0000-000000000011', 'Trekking & Outdoor Adventure', 'Adventure', 'Weekend hikes, hill climbs, camping, trail exploration, stargazing'),
    ('11111111-0000-0000-0000-000000000012', 'Campus Football Turf', 'Sports', 'Late-night football, 5v5 turf matches, tactical games, campus tournament'),
    ('11111111-0000-0000-0000-000000000013', 'Cricket Club', 'Sports', 'Box cricket, leather ball matches, weekend practice on sports oval'),
    ('11111111-0000-0000-0000-000000000014', 'Voluntourism & Teaching', 'Social', 'Weekend teaching in rural schools, environmental drives, NGO collaboration'),
    ('11111111-0000-0000-0000-000000000015', 'Leadership & Public Speaking', 'Social', 'Debating, Model UN, pitching, introverted confidence building, Toastmasters')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Campus Groups / Clubs
INSERT INTO public.groups (
    id, name, slug, description, category, image_url, location, meeting_information, contact_lead, contact_information, target_audience, is_active
) VALUES
(
    '22222222-0000-0000-0000-000000000001',
    'Aatmoday Cultural & Dance Society',
    'cultural-dance-society',
    'The heart of classical dance, folk performances, stage hosting, and festival celebrations at Aatmoday. We organize major campus cultural nights, choreograph group dance pieces, and train hosts for stage events.',
    'Performing Arts',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=60',
    'Student Activity Center (SAC Hall A)',
    'Every Tuesday & Thursday at 6:30 PM',
    'Zara Khan',
    'Zara Khan (Lead), @zara_cultural, +91 98765 43210',
    'Dancers, stage hosts, and cultural event enthusiasts of all levels',
    TRUE
),
(
    '22222222-0000-0000-0000-000000000002',
    'Aatmoday Robotics & Hardware Hub',
    'robotics-hardware-hub',
    'Building autonomous bots, drone systems, microcontrollers (Arduino/ESP32), and ROS-based software. We compete in national Robocon and hardware hackathons.',
    'Technology',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60',
    'Robotics Lab (Engineering Block 3rd Floor)',
    'Every Wednesday & Saturday at 5:00 PM',
    'Rohan Patel',
    'Rohan Patel (Lead), @rohan_robotics',
    'Coders, hardware geeks, and tech tinkerers',
    TRUE
),
(
    '22222222-0000-0000-0000-000000000003',
    'Aatmoday Developers Club (ADC)',
    'developers-club-adc',
    'Open source builders, full-stack engineers, AI tinkerers, and late-night competitive coders. We ship side projects, host 24-hour campus hackathons, and help each other ace internships.',
    'Technology',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60',
    'Computer Center Lab 4',
    'Every Monday & Thursday at 7:00 PM',
    'Aditya Verma',
    'Aditya Verma (Lead), @aditya_adc',
    'Software developers, hackathon competitors, and curious coders',
    TRUE
),
(
    '22222222-0000-0000-0000-000000000004',
    'Unplugged (Music Club)',
    'unplugged-music-club',
    'Acoustic guitar sessions, vocal harmonies, gentle jams under campus lights, and open-mic evenings. Perfect for introverted musicians, shy singers, and guitar strummers looking for cozy vibes.',
    'Performing Arts',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60',
    'Cultural Center Garden & Amphitheater',
    'Every Friday at 7:00 PM',
    'Kabir Trivedi',
    'Kabir Trivedi (Head), @kabir_unplugged',
    'Musicians, vocalists, acoustic players, and gentle listeners',
    TRUE
),
(
    '22222222-0000-0000-0000-000000000005',
    'FragZone Esports & Gaming Guild',
    'fragzone-esports-gaming',
    'Competitive and casual campus esports community. Late-night Valorant lobbies, BGMI campus scrims, FIFA console battles, and indie game development sprints.',
    'Technology',
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=60',
    'Recreation Hall & Discord Server',
    'Every Wednesday & Friday at 9:30 PM (Discord & Rec Hall)',
    'Dhruv Shah',
    'Dhruv Shah (Guild Captain), @dhruv_fragzone',
    'Casual and ranked gamers, streamers, and game designers',
    TRUE
),
(
    '22222222-0000-0000-0000-000000000006',
    'Trekking Community',
    'trekking-community',
    'Weekend hikes, Pavagadh climbs, night treks, camping, and outdoor exploration. Designed for introverted nature lovers, photographers, and adventure seekers alike.',
    'Adventure',
    'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&auto=format&fit=crop&q=60',
    'Sports Complex Lawn & WhatsApp Group',
    'Every Thursday at 8:00 PM for weekend trip planning',
    'Arjun Nair',
    'Arjun Nair (Trek Lead), @arjun_treks',
    'Hikers, nature enthusiasts, and quiet outdoor lovers',
    TRUE
),
(
    '22222222-0000-0000-0000-000000000007',
    'Kartavya Voluntourism & Impact Drive',
    'kartavya-voluntourism',
    'Weekend educational outreach, village school teaching, cleanliness drives, and social impact camps. Travel with a purpose and bring real smiles to nearby communities.',
    'Social',
    'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=60',
    'Old Admin Block Room 102',
    'Every Saturday morning at 9:00 AM',
    'Pooja Joshi',
    'Pooja Joshi (Coordinator), @pooja_kartavya',
    'Students who want to make a meaningful difference and give back',
    TRUE
),
(
    '22222222-0000-0000-0000-000000000008',
    'Chhayachitra (Photography & Content Guild)',
    'chhayachitra-photography-guild',
    'Photowalks, portraiture experiments, drone shots, and Instagram/Reel storytelling. Learn lighting, camera settings, and editing from peers.',
    'Creative',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60',
    'Media Lab & Campus Central Fountain',
    'Every Sunday morning at 8:00 AM (Photowalk)',
    'Meera Desai',
    'Meera Desai (Lead), @meera_clicks',
    'Mobile photographers, DSLR shooters, and aesthetic content creators',
    TRUE
),
(
    '22222222-0000-0000-0000-000000000009',
    'Nukkad Natak (Street Theater Group)',
    'nukkad-natak-street-theater',
    'Street plays, social awareness performances, high-energy chants, and theatrical storytelling. We take burning social messages to campus courtyards and city squares.',
    'Performing Arts',
    'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&auto=format&fit=crop&q=60',
    'Amphitheater Steps & Campus Courtyard',
    'Every Monday & Friday at 6:00 PM',
    'Diya Kapoor',
    'Diya Kapoor (Convener), @diya_nukkad',
    'Passionate actors, scriptwriters, voice artists, and performers',
    TRUE
),
(
    '22222222-0000-0000-0000-000000000010',
    'Aatmoday Turf Football League',
    'aatmoday-turf-football',
    'Night matches under floodlights on the newly built campus turf. Casual 5-a-side friendlies, tactical passing drills, and inter-hostel weekend cups.',
    'Sports',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=60',
    'Campus Turf Arena (Near Hostel 4)',
    'Every Monday, Wednesday & Saturday at 9:00 PM',
    'Varun Rao',
    'Varun Rao (Captain), @varun_turf',
    'Football fans, casual runners, and tournament contenders',
    TRUE
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    image_url = EXCLUDED.image_url,
    location = EXCLUDED.location,
    meeting_information = EXCLUDED.meeting_information,
    contact_lead = EXCLUDED.contact_lead,
    contact_information = EXCLUDED.contact_information,
    target_audience = EXCLUDED.target_audience;

-- 3. Insert Upcoming Campus Events (Always in Future >= NOW())
INSERT INTO public.events (
    id, group_id, name, description, event_type, event_date, location, image_url, registration_url, contact_lead, contact_information, target_audience, is_active
) VALUES
(
    '33333333-0000-0000-0000-000000000001',
    '22222222-0000-0000-0000-000000000001',
    'Aatmoday Cultural Night & Garba Fusion',
    'An electric evening of classical fusion, live dhol, stage anchoring auditions, and campus Garba night. Free entry for all students.',
    'cultural_night',
    NOW() + INTERVAL '7 days',
    'University Main Amphitheater',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60',
    'https://aatmoday.edu/events/cultural-night-2026',
    'Zara Khan',
    'Zara Khan (Lead), @zara_cultural',
    'All campus students, dancers, and stage hosts',
    TRUE
),
(
    '33333333-0000-0000-0000-000000000002',
    '22222222-0000-0000-0000-000000000003',
    'AatmoHacks 2026 — 24H AI & Web Hackathon',
    '24-hour campus hackathon building real-world AI, Web3, and mobile apps. Free food, red bull, sponsor swag, and prizes worth 1.5 Lakhs.',
    'hackathon',
    NOW() + INTERVAL '14 days',
    'Engineering Building Labs 301-305',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60',
    'https://aatmohacks.dev',
    'Aditya Verma',
    'Aditya Verma (Lead), @aditya_adc',
    'Coders, designers, product minds, and enthusiastic beginners',
    TRUE
),
(
    '33333333-0000-0000-0000-000000000003',
    '22222222-0000-0000-0000-000000000004',
    'Acoustic Sunset Open-Mic',
    'Gentle outdoor acoustic guitars, indie vocals, poetry readings, and chai under the campus banyan tree. Super warm and beginner-friendly.',
    'open_mic',
    NOW() + INTERVAL '5 days',
    'Cultural Garden Lawn',
    'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=60',
    'https://aatmoday.edu/events/acoustic-sunset',
    'Kabir Trivedi',
    'Kabir Trivedi (Head), @kabir_unplugged',
    'Acoustic musicians, poets, and gentle listeners',
    TRUE
),
(
    '33333333-0000-0000-0000-000000000004',
    '22222222-0000-0000-0000-000000000006',
    'Sunrise Pavagadh Trail Trek',
    'Early morning sunrise climb up Pavagadh hills, breakfast at scenic ridge, and landscape photography session. Bus departs at 5:00 AM.',
    'trek',
    NOW() + INTERVAL '12 days',
    'Pavagadh Base (Bus pickup at Main Gate)',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=60',
    'https://aatmoday.edu/treks/pavagadh-sunrise',
    'Arjun Nair',
    'Arjun Nair (Trek Lead), @arjun_treks',
    'Nature lovers, photographers, and hikers',
    TRUE
),
(
    '33333333-0000-0000-0000-000000000005',
    '22222222-0000-0000-0000-000000000010',
    'Midnight Campus Turf 5v5 Championship',
    'High-octane 5-a-side floodlight football tournament. 16 hostel teams, knockout format, trophies, and midnight pizza for all participants.',
    'tournament',
    NOW() + INTERVAL '18 days',
    'Campus Turf Arena',
    'https://images.unsplash.com/photo-1529900241450-482a8740523d?w=800&auto=format&fit=crop&q=60',
    'https://aatmoday.edu/sports/midnight-turf-cup',
    'Varun Rao',
    'Varun Rao (Captain), @varun_turf',
    'Football lovers, hostel squads, and sports fans',
    TRUE
),
(
    '33333333-0000-0000-0000-000000000006',
    '22222222-0000-0000-0000-000000000008',
    'Golden Hour Campus Photowalk & Reel Sprint',
    'Hands-on mobile framing and camera masterclass around vintage campus architecture, followed by a 30-minute aesthetic reel editing session.',
    'workshop',
    NOW() + INTERVAL '9 days',
    'Heritage Library Steps & Central Garden',
    'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&auto=format&fit=crop&q=60',
    'https://aatmoday.edu/events/golden-hour-walk',
    'Meera Desai',
    'Meera Desai (Lead), @meera_clicks',
    'Creators, photographers, and visual storytellers',
    TRUE
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    event_type = EXCLUDED.event_type,
    event_date = EXCLUDED.event_date,
    location = EXCLUDED.location,
    image_url = EXCLUDED.image_url,
    registration_url = EXCLUDED.registration_url;
