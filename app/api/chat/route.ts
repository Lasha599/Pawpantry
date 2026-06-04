import { NextRequest } from 'next/server';

export const runtime = 'edge';

const CATALOG = `
PawPantry product catalog:
1.  NorthPaw Naturals – Wild Salmon & Sweet Potato ($54.99 / 12 kg) | Adult, Medium | grain-free, high-protein | salmon, sweet potato, peas, flaxseed | ★4.7
2.  TrailMix Canine – Mountain Recipe Adult ($42.50 / 15 kg) | Adult, Large | chicken, brown rice, barley, carrots | ★4.4
3.  Kibble & Co. – Puppy Growth Formula ($38.00 / 8 kg) | Puppy, Medium | high-protein | chicken, oats, salmon oil, blueberries | ★4.8
4.  Hearth & Hound – Senior Wellness Lamb ($49.99 / 10 kg) | Senior, Medium | weight-control | lamb, brown rice, glucosamine, pumpkin | ★4.6
5.  NorthPaw Naturals – Small Breed Turkey ($36.00 / 5 kg) | Adult, Small | grain-free, high-protein | turkey, lentils, spinach, flaxseed | ★4.5
6.  TrailMix Canine – Large Breed Beef ($58.99 / 18 kg) | Adult, Large | high-protein | beef, brown rice, carrots, spinach | ★4.3
7.  Kibble & Co. – Weight Management Adult ($44.00 / 11 kg) | Adult, Medium | weight-control | chicken, barley, L-carnitine, fiber blend | ★4.2
8.  Hearth & Hound – Limited Ingredient Duck ($62.00 / 10 kg) | Adult, Medium | grain-free | duck, sweet potato, pumpkin | ★4.9
9.  NorthPaw Naturals – Senior Small Breed ($39.99 / 4 kg) | Senior, Small | weight-control | chicken, oats, glucosamine | ★4.5
10. TrailMix Canine – Puppy Large Breed ($46.50 / 14 kg) | Puppy, Large | high-protein | chicken, rice, fish oil, calcium | ★4.6
11. Kibble & Co. – Performance High-Energy ($56.00 / 13 kg) | Adult, Large | high-protein | chicken, beef, rice, fish meal | ★4.4
12. Hearth & Hound – Grain-Free Venison ($68.00 / 11 kg) | Adult, Medium | grain-free, high-protein | venison, sweet potato, peas, blueberries | ★4.8
`.trim();

const SYSTEM_PROMPT = `You are PawPantry's expert dog nutrition advisor. Help customers choose the best dog food for their pet, explain nutritional values, and answer delivery questions.

STRICT RULES — follow exactly:
1. ONLY answer questions about dog food, canine nutrition, breed-specific dietary needs, ingredient analysis, and PawPantry delivery estimates. Politely decline anything else.
2. If you are not confident, respond ONLY with: "I don't have reliable information on that. Please consult your veterinarian for personalized advice."
3. NEVER speculate or fabricate facts.
4. ALWAYS end your response with a "Source:" line citing a real, specific source (e.g., "Source: AAFCO Nutrient Profiles for Dog Foods, 2024" or "Source: American Kennel Club – Nutrition Guidelines").
5. Keep responses concise — 4–5 sentences maximum.
6. Delivery estimates: standard shipping 3–5 business days; express shipping 1–2 business days.
7. When recommending products, reference items from the PawPantry catalog.
8. For any breed-specific or medical dietary advice always append: "Consult your vet to confirm this fits your dog's individual health needs."

Core nutrition facts you may use:
- Puppies need ≥22% crude protein (DM basis) and higher calcium/phosphorus for bone development (AAFCO)
- Adult dogs need ≥18% crude protein (DM basis) (AAFCO)
- Senior dogs benefit from reduced calories, added glucosamine for joints, and highly digestible proteins
- Small breeds have faster metabolisms and need calorie-dense food; kibble size matters for jaw size
- Large-breed puppies need controlled calcium (0.7–1.2% DM) to prevent developmental orthopedic disease
- Grain-free diets suit grain-sensitive dogs; note the FDA is investigating a potential link between grain-free diets and dilated cardiomyopathy (DCM) — always disclose this when recommending grain-free
- Common allergens: chicken, beef, dairy, wheat, eggs, soy, corn
- Omega-3 fatty acids (fish oil, flaxseed) support skin, coat, and joint health

${CATALOG}`;

export async function POST(req: NextRequest) {
  const { messages, dogContext } = await req.json();

  const systemContent = dogContext
    ? `${SYSTEM_PROMPT}\n\nUSER'S DOG PROFILES (use this context to personalize recommendations):\n${dogContext}`
    : SYSTEM_PROMPT;

  const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://pawpantry.app',
      'X-Title': 'PawPantry AI Nutrition Advisor',
    },
    body: JSON.stringify({
      model: 'nvidia/nemotron-3-nano-30b-a3b:free',
      stream: true,
      messages: [{ role: 'system', content: systemContent }, ...messages],
    }),
  });

  if (!upstream.ok) {
    return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}
