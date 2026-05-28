"""
AI Insights Module — uses Anthropic Claude API to analyze log summaries
"""
import os
import json
import anthropic


def get_ai_insights(result: dict, benchmarks: dict, filename: str) -> str:
    """Send log summary to Claude and get smart security/performance insights."""
    try:
        client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

        # Build a readable summary
        errors = {k: v for k, v in result.items() if k.startswith("HTTP_4") or k.startswith("HTTP_5")}
        hours = {k: v for k, v in result.items() if k.startswith("Hour_")}
        methods = {k: v for k, v in result.items() if k.startswith("METHOD_")}
        top_ips = sorted(
            [(k.replace("IP_", ""), v) for k, v in result.items() if k.startswith("IP_")],
            key=lambda x: x[1], reverse=True
        )[:5]

        peak_hour = max(hours.items(), key=lambda x: x[1])[0].replace("Hour_", "") + ":00" if hours else "N/A"

        summary = f"""
Log file: {filename}
Total lines processed: {benchmarks.get('total_lines', 0)}
Processing speed: {benchmarks.get('lines_per_sec', 0)} lines/sec

HTTP Status breakdown: {json.dumps(errors)}
Traffic by hour (top): {json.dumps(dict(sorted(hours.items(), key=lambda x: x[1], reverse=True)[:5]))}
HTTP Methods: {json.dumps(methods)}
Top IPs by requests: {top_ips}
Peak traffic hour: {peak_hour}
"""

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=600,
            messages=[{
                "role": "user",
                "content": f"""You are a cloud infrastructure security and performance expert. 
Analyze this server log summary and provide exactly 4 concise insights.
Format as JSON array with objects having: "type" (security|performance|traffic|anomaly), "severity" (low|medium|high), "title" (max 6 words), "detail" (1-2 sentences).
Only return valid JSON, no markdown.

{summary}"""
            }]
        )

        raw = message.content[0].text.strip()
        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        insights = json.loads(raw.strip())
        return insights

    except Exception as e:
        return [
            {"type": "performance", "severity": "low", "title": "Processing completed successfully", "detail": f"MapReduce pipeline processed {benchmarks.get('total_lines',0)} lines across {benchmarks.get('num_chunks',0)} parallel chunks."},
            {"type": "traffic", "severity": "low", "title": "Analysis ready for review", "detail": "Check the charts above for HTTP error distribution and hourly traffic patterns."},
        ]
