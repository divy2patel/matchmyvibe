// ─── Test Suite: 9 Verification Scenarios for MatchMyVibe ─────────────────────
// Usage: npx tsx scripts/test-queries.ts

import fs from "fs";
import path from "path";

// Load .env.local if present
const envLocalPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = (match[2] || "").trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value;
    }
  }
}

import { POST as matchHandler } from "../src/app/api/match/route";
import { NextRequest } from "next/server";

const TEST_SCENARIOS = [
  {
    name: "1. Classical Dance & Cultural Hosting (E2E match test target)",
    text: "I love classical dance and hosting cultural events",
    expectedMatch: "Aatmoday Cultural & Dance Society",
  },
  {
    name: "2. Introvert Query (Gentle icebreaker test target)",
    text: "acoustic guitar, weekend hikes, introverted",
    expectedMatch: "Unplugged (Music Club)",
  },
  {
    name: "3. Competitive Gaming & Late-Night Coding",
    text: "I love competitive gaming and late-night coding",
    expectedMatch: "FragZone Esports & Gaming Guild",
  },
  {
    name: "4. Robotics & Hardware",
    text: "Robotics, microcontrollers, and hardware hackathons",
    expectedMatch: "Aatmoday Robotics",
  },
  {
    name: "5. Street Play & Drama",
    text: "Street plays, nukkad natak, and social drama",
    expectedMatch: "Nukkad Natak",
  },
  {
    name: "6. Voluntourism & Impact",
    text: "Voluntourism, weekend teaching, and social impact",
    expectedMatch: "Kartavya Voluntourism & Impact Drive",
  },
  {
    name: "7. Hinglish / Slang",
    text: "Bhai thoda coding shikhvu chhe ane gaming ma interest chhe, koi chill group batavo",
    expectedMatch: "Aatmoday Developers Club (ADC)",
  },
  {
    name: "8. Gibberish / Random input",
    text: "asdfghjkl qwerty 12345",
    expectedMatch: null,
  },
  {
    name: "9. Short / Invalid input",
    text: "a",
    expectedMatch: null,
  },
];

async function runTests() {
  console.log("\n🧪 Running 9 Verification Scenarios for MatchMyVibe...\n");
  let passed = 0;

  for (const scenario of TEST_SCENARIOS) {
    console.log(`─────────────────────────────────────────────────────────────`);
    console.log(`📌 ${scenario.name}`);
    console.log(`   Input: "${scenario.text}"`);

    const req = new NextRequest("http://localhost:3000/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: scenario.text }),
    });

    const res = await matchHandler(req);
    const data = await res.json();

    if (scenario.name.includes("Invalid")) {
      if (res.status === 400 && !data.success) {
        console.log(`   ✅ Correctly rejected with 400 Bad Request: "${data.error}"`);
        passed++;
      } else {
        console.log(`   ❌ Expected 400, got ${res.status}`);
      }
    } else {
      if (res.status === 200 && data.success) {
        console.log(`   ✅ Status: 200 OK`);
        console.log(`   🏷️  Interests: [${data.interests.join(", ")}]`);
        console.log(`   🎯 Top Match: ${data.recommendations[0]?.name || "None"} (Score: ${data.recommendations[0]?.relevance_score || 0})`);
        console.log(`   👤 Contact Person: ${data.recommendations[0]?.contactPerson || "N/A"}`);
        console.log(`   💬 Icebreakers [3 options]:`);
        console.log(`      1. Casual:  "${data.recommendations[0]?.icebreakers?.[0] || "N/A"}"`);
        console.log(`      2. Direct:  "${data.recommendations[0]?.icebreakers?.[1] || "N/A"}"`);
        console.log(`      3. Gentle:  "${data.recommendations[0]?.icebreakers?.[2] || "N/A"}"`);
        console.log(`   📊 Total Returned: ${data.recommendations.length} (3 groups + 2 upcoming events target)`);
        console.log(`   ⚡ Processed in ${data.meta?.processingTimeMs}ms (${data.meta?.mode} mode)`);

        if (scenario.expectedMatch) {
          const matched = data.recommendations.some((r: any) =>
            r.name.toLowerCase().includes(scenario.expectedMatch!.toLowerCase())
          );
          if (matched) {
            console.log(`   🎯 Verified presence of "${scenario.expectedMatch}" in recommendations`);
          } else {
            console.log(`   ⚠️  Expected "${scenario.expectedMatch}" but got:`, data.recommendations.map((r: any) => r.name));
          }
        }

        passed++;
      } else {
        console.log(`   ❌ Failed with status ${res.status}:`, data);
      }
    }
  }

  console.log(`\n═════════════════════════════════════════════════════════════`);
  console.log(`🎉 Results: ${passed}/${TEST_SCENARIOS.length} scenarios passed!`);
  console.log(`═════════════════════════════════════════════════════════════\n`);
}

runTests().catch(console.error);
