function testCleanup(text) {
    console.log("Original:", text);

    let cleanText = text.replace(/```json|```/g, '').trim();

    // CURRENT BROKEN LOGIC
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');

    // Simulating the bug: It defaults to object logic
    let buggyText = cleanText;
    if (firstBrace !== -1 && lastBrace !== -1) {
        buggyText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    console.log("Buggy Result:", buggyText);

    try {
        JSON.parse(buggyText);
        console.log("✅ Msg: Valid JSON");
    } catch (e) {
        console.log("❌ Msg: Parse Failed");
    }

    // PROPOSED FIX
    const firstOpen = cleanText.search(/[{\[]/); // Find first { or [
    const lastClose = cleanText.search(/[}\]]$/); // Find last } or ] purely?
    // Actually regex is better: find first [ or { and last ] or }

    // Better finder:
    const firstCurly = cleanText.indexOf('{');
    const firstSquare = cleanText.indexOf('[');
    let start = -1;

    if (firstCurly !== -1 && firstSquare !== -1) {
        start = Math.min(firstCurly, firstSquare);
    } else if (firstCurly !== -1) {
        start = firstCurly;
    } else {
        start = firstSquare;
    }

    const lastCurly = cleanText.lastIndexOf('}');
    const lastSquare = cleanText.lastIndexOf(']');
    let end = Math.max(lastCurly, lastSquare);

    let fixedText = cleanText;
    if (start !== -1 && end !== -1) {
        fixedText = cleanText.substring(start, end + 1);
    }

    console.log("Fixed Result:", fixedText);
    try {
        JSON.parse(fixedText);
        console.log("✅ Fix: Valid JSON");
    } catch (e) {
        console.log("❌ Fix: Parse Failed");
    }
}

testCleanup('```json\n[ { "a": 1 } ]\n```');
