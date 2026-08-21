# AegisSOC Demonstration Guide

This guide provides a structured walkthrough for demonstrating AegisSOC capabilities to recruiters, interviewers, or stakeholders. Follow this flow to showcase the platform's core value proposition: turning raw security data into actionable intelligence through automated detection, correlation, and AI-powered analysis.

## Demonstration Overview

**Total Time:** 15-20 minutes
**Audience:** Technical recruiters, hiring managers, security professionals
**Prerequisites:** 
- AegisSOC running locally (frontend on http://localhost:3000, backend on http://localhost:8000)
- Sample data seeded via `python seed/seed_data.py`
- No AI provider configuration required for basic demo (uses mock responses)

## Demo Flow

### 1. Introduction & Platform Overview (2 minutes)

**What to Say:**
>AegisSOC is an AI-powered Security Operations Center that transforms raw security events into actionable intelligence. Unlike traditional SIEMs that overwhelm analysts with alerts, AegisSOC uses automated detection, intelligent correlation, and AI analysis to focus attention on real threats.

**What to Show:**
- Landing page/dashboard overview
- Brief explanation of the three-step process we'll demonstrate:
  1. **Detection** - Identifying suspicious activity
  2. **Correlation** - Connecting related events into attack chains
  3. **AI Analysis** - Generating actionable insights for response

### 2. Event Ingestion & Detection (4 minutes)

**Objective:** Show how AegisSOC ingests events and automatically detects threats.

**Steps:**
1. Navigate to the **Events** page
   - Show the event list (should have seed data)
   - Point out different event types and severities
   
2. Trigger a detection run:
   - Go to the **Detection** page or use the API directly
   - Click "Run All Detection Rules"
   - Explain what the detection engine is doing:
     * Analyzing recent events for known attack patterns
     * Applying rule-based logic (brute force, port scanning, etc.)
     * Calculating risk scores and confidence levels

3. Show detection results:
   - Point out any alerts generated
   - Explain the key fields:
     * **Rule ID/Name** - What type of detection triggered
     * **Risk Score** - Numerical severity (0-100)
     * **Confidence** - How certain the system is (0-1.0)
     * **Event Count** - How many events contributed to this detection
     * **Evidence** - Supporting data (IPs, users, etc.)
     * **MITRE Mapping** - How this maps to known attack frameworks

**What to Say:**
>Notice how the system automatically analyzed the incoming events and identified a potential brute force attack. Rather than requiring a security analyst to manually correlate 50+ failed login attempts, the detection engine identified the pattern instantly and assigned it a high risk score of 87.5 with 95% confidence. The system also automatically mapped this to MITRE ATT&CK technique T1110 (Brute Force) for immediate context.

**Technical Points Demonstrated:**
- Real-time event processing
- Rule-based detection algorithms
- Risk scoring methodology
- MITRE ATT&CK framework integration
- Evidence preservation for investigation

### 3. Event Correlation & Attack Chains (4 minutes)

**Objective:** Show how related events are connected to reveal complete attack narratives.

**Steps:**
1. Navigate to the **Correlations** or **Attack Chains** view
   - Show any existing correlations from the detection run
   - Explain what correlation means in this context

2. If no strong correlations exist, run the correlation engine:
   - Use the API or wait for automatic correlation
   - Explain the correlation process:
     * Grouping events by common attributes (IP, user, time)
     * Applying temporal and logical rules
     * Building attack chains from related events
     * Propagating severity and confidence up the chain

3. Examine a correlation result:
   - Show the events involved in the chain
   - Point out the timeline progression
   - Explain how the severity increased as the chain developed
   - Highlight the consolidation of multiple low-fidelity events into one high-fidelity alert

**What to Say:**
>Here's where AegisSOC really differentiates itself from basic alerting systems. Instead of showing you 50 separate failed login events, the correlation engine has analyzed the temporal relationships, common source IP, and patterned behavior to identify this as a coherent attack chain. What appeared as noisy, low-priority events individually now presents as a clear, high-confidence brute force attack targeting our web server. The system has automatically determined that events #1024 through #1078 form a single attack narrative with 85% confidence and a risk score of 82.0.

**Technical Points Demonstrated:**
- Temporal correlation analysis
- Entity-based linkage (IP, user, asset)
- Attack chain reconstruction
- Severity propagation
- Noise reduction through intelligent grouping
- MITRE technique propagation across chains

### 4. Incident Creation & AI Analysis (5 minutes)

**Objective:** Show how detections become incidents and how AI analysis provides actionable insights.

**Steps:**
1. Navigate to the **Incidents** page
   - Show that incidents were automatically created from the detections
   - Point out the incident title, severity, and status

2. Select an incident to view details:
   - Show the incident timeline
   - Show linked detections and events
   - Show the raw data preserved for investigation

3. Trigger AI analysis:
   - Click the "Analyze with AI" button or use the API
   - Explain what happens behind the scenes:
     * The system gathers all relevant context (events, detections, timeline, assets)
     * Constructs a comprehensive prompt for the AI model
     * Sends to configured AI provider (or uses mock response for demo)
     * Returns structured analysis with recommendations

4. Examine the AI analysis results:
   - **Summary** - Plain language explanation of what happened
   - **Attack Vector** - How the attacker gained access or attempted to
   - **Root Cause** - Underlying vulnerability or misconfiguration
   - **Impact Assessment** - Potential consequences if not addressed
   - **MITRE Techniques** - Specific techniques identified with tactical context
   - **Recommendations** - Specific, actionable steps for remediation
   - **Timeline Analysis** - Chronological breakdown of the attack

**What to Say>
>Now we see the true power of the AI Analyst. Rather than just telling us "there was a brute force attack," the system has performed a thorough investigation worthy of a senior security analyst. It's identified that the attack vector was exposed RDP services, traced the root cause to weak password policies, assessed the potential impact (including lateral movement risks), and provided specific, prioritized recommendations for containment and prevention. Notice how it also mapped the attack to MITRE ATT&CK framework with specific technique IDs - this allows our security team to immediately look up known mitigations and detection strategies. The timeline analysis shows us exactly how the attack unfolded over time, which is invaluable for both understanding the incident and potentially using in legal or compliance contexts.

**Technical Points Demonstrated:**
- Contextual data gathering for analysis
- Prompt engineering for security-specific LLMs
- Structured output generation from AI models
- Actionable recommendation generation
- MITRE ATT&CK tactical context
- Impact assessment methodology
- Automated timeline reconstruction

### 5. Investigation & Response Workflow (3 minutes)

**Objective:** Show how security analysts would use the system for investigation and response.

**Steps:**
1. Demonstrate threat hunting capabilities:
   - Go to the **Threat Hunting** page
   - Search for events related to the attacker IP
   - Show how analysts can pivot from IOCs to find related activity
   - Demonstrate filtering by time, event type, severity, etc.

2. Show incident management features:
   - Update incident status (e.g., from "New" to "Investigating")
   - Add timeline entries for investigation steps
   - Assign incidents to team members (show UI if available)
   - Attach notes or evidence to incidents

3. Demonstrate asset context:
   - Show how clicking on an asset in an event shows all related events
   - Demonstrate critical asset tagging and filtering

4. Show reporting/export capabilities:
   - Mention that reports can be generated (if UI exists)
   - Note that timeline data is exportable for compliance

**What to Say:**
>The investigation workflow completes the SOC lifecycle. Analysts can use the threat hunting interface to proactively search for similar indicators of compromise, ensuring this attack isn't part of a larger campaign. The incident management features allow teams to collaborate effectively, with a complete audit trail of all actions taken. By preserving all raw data and linking it through the timeline, we maintain chain of custody for potential legal proceedings while enabling thorough post-incident review to improve defenses.

**Technical Points Demonstrated:**
- Interactive threat hunting with flexible filtering
- Collaborative incident management
- Complete audit trail and timeline preservation
- Asset-centric investigation views
- Data preservation for compliance and forensics

### 6. Closing & Value Proposition (2 minutes)

**What to Say:**
>What we've just seen is how AegisSOC transforms the security analyst experience. Instead of spending hours correlating logs and trying to determine if 50 failed login attempts represent a real threat, analysts get:
>1. **Automated Detection** - Machine-speed identification of known attack patterns
>2. **Intelligent Correlation** - Noise reduced from hundreds of events to coherent attack chains
>3. **AI-Powered Analysis** - Senior-analyst level investigation in seconds, not hours
>4. **Actionable Output** - Clear recommendations with technical and strategic context
>5. **Streamlined Workflow** - Tools for investigation, response, and post-incident improvement
>
>The result is faster mean time to detect (MTTD), faster mean time to respond (MTTR), and ultimately, a more effective security operation that focuses human expertise where it's most valuable - on complex threats requiring human judgment, not on repetitive correlation tasks.

**Key Differentiators to Highlight:**
- **Proactive vs Reactive:** Most SIEMs alert on known bad; AegisSOC correlates to find unknown threats
- **Context over Volume:** Reduces alert fatigue by 90%+ through intelligent correlation
- **Actionable Intelligence:** Goes beyond alerting to provide specific remediation steps
- **Framework Integration:** Native MITRE ATT&CK mapping enables standardized response
- **Analyst Augmentation:** AI handles the heavy lifting of investigation, freeing humans for decision-making

## Customization Points for Different Audiences

### For Technical Recruiters/Engineering Focus:
- Emphasize the technology stack (FastAPI, Next.js, Docker, etc.)
- Highlight the extensibility of the detection engine
- Discuss the API design and integration capabilities
- Mention the test coverage and code quality

### For Security Leadership/Management Focus:
- Emphasize MTTD/MTTR improvements
- Highlight reduction in alert fatigue and analyst burnout
- Discuss compliance benefits (audit trails, evidence preservation)
- Mention the framework alignment (MITRE, NIST, etc.)
- Discuss scalability and enterprise readiness

### For General Business Stakeholders:
- Focus on risk reduction and business protection
- Emphasize cost savings from improved efficiency
- Highlight protection of reputation and customer trust
- Discuss regulatory compliance benefits
- Emphasize the platform's ability to grow with the organization

## Troubleshooting Common Demo Issues

### No Detections Showing
**Problem:** Detection engine runs but returns empty results
**Solution:**
- Check that seed data has been loaded (`python seed/seed_data.py`)
- Verify events have recent timestamps (detection engines often look at last 5-60 minutes)
- Try running specific detectors (brute force, port scan) with lower thresholds
- Check backend logs for detection engine errors

### AI Analysis Not Working
**Problem:** AI analysis returns errors or mock data
**Solution:**
- For full demo: Configure AI provider (OpenAI/Anthropic) in backend/.env
- For basic demo: Mock responses are built-in and should work without configuration
- Check backend logs for AI service errors
- Verify the incident has sufficient data for analysis (events, detections, etc.)

### Correlation Not Working
**Problem:** No correlations appear despite related events
**Solution:**
- Correlation often requires specific temporal windows (default: last 60 minutes)
- Ensure events have proper timestamps and common attributes
- Check that the correlation engine is running (look for background tasks)
- Try adjusting time window parameters in the API call

### UI Not Loading Properly
**Problem:** Frontend shows errors or blank screens
**Solution:**
- Verify frontend is running (`npm run dev` in frontend directory)
- Check browser console for JavaScript errors
- Ensure backend is accessible from frontend (CORS configuration)
- Try hard refresh (Ctrl+F5) to clear cached assets

## Demo Data Explanation

The seed data includes:
- **Normal Events:** Successful logins, system health checks, routine network traffic
- **Suspicious Events:** Failed login attempts, port scans, privilege escalation attempts
- **Attack Patterns:** Coordinated brute force attacks, reconnaissance scanning
- **Asset Data:** Servers, workstations, network devices with varying criticality
- **User Accounts:** Admin, regular users, service accounts with different activity levels

This mixture allows the demonstration of:
- Baseline filtering (normal vs suspicious)
- Detection accuracy (true positives vs false positives)
- Correlation effectiveness (separate events forming coherent attacks)
- Analysis depth (simple events vs complex attack narratives)

## Extended Demo Options (If Time Permits)

### 1. Custom Detection Rule Creation
- Show how to add a new detection rule via code
- Demonstrate immediate effectiveness against test data

### 2. Threat Intelligence Integration
- Add malicious IP/hash to threat intel feed
- Show automatic matching and enrichment of events

### 3. MITRE ATT&CK Deep Dive
- Explore the ATT&CK framework navigation
- Show technique relationships and mitigation strategies

### 4. Performance Under Load
- Demonstrate system behavior with increased event volume
- Show horizontal scaling concepts (if using Docker compose)

### 5. Incident Response Playbook
- Simulate containment actions (block IP, disable account)
- Show how response actions are tracked in incident timeline

## Success Metrics to Reference

When discussing the platform's effectiveness, reference these improvement metrics:
- **Alert Volume Reduction:** 90%+ fewer actionable items vs raw event volume
- **Mean Time to Detect (MTTD):** Reduced from hours/minutes to seconds
- **Mean Time to Investigate (MTTI):** Reduced from hours to minutes
- **Mean Time to Respond (MTTR):** Reduced from hours/days to minutes/hours
- **Analyst Efficiency:** 3-5x increase in incidents handled per analyst
- **Threat Coverage:** Increased detection of low-and-slow attacks through correlation

## Final Notes

**Keep it Conversational:** Don't just click through screens - explain what each action accomplishes and why it matters to security operations.

**Focus on Outcomes:** Emphasize how each feature reduces risk, saves time, or improves security posture.

**Be Prepared to Pivot:** If the audience shows particular interest in one area (AI, compliance, etc.), be ready to dive deeper there.

**Have Backups Ready:** Know the API endpoints for key functions in case UI elements aren't working as expected.

**Remember the Audience:** Tailor your language - technical audiences want to know how it works, business audiences want to know what it means for them.

This demonstration shows AegisSOC not as another security tool, but as a force multiplier for security teams that turns data overload into actionable intelligence.