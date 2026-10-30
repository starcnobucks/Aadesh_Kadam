import { PortfolioData } from '../types/portfolio';

export const portfolioContent: PortfolioData = {
  identity: {
    name: 'Aadesh Kadam',
    role: 'Generative AI Engineer',
    introduction:
      'Generative AI and Agentic Systems engineer architecting autonomous multi-agent pipelines, evidence-grounded RAG runtimes, fine-tuned models, and cloud-native infrastructure.',
    status: 'ODYSSEY ACTIVE // AUTONOMOUS RUNTIME',
  },
  projects: [
    {
      id: 'devops-incident-agent',
      title: 'Autonomous DevOps Incident Response Agent',
      tagline: 'Agentic Infrastructure Reliability & Self-Healing Telemetry',
      description:
        'An agentic infrastructure reliability system designed to detect incidents, investigate logs and metrics, identify potential root causes, propose safe remediation actions, execute approved operations and verify service recovery.',
      detailedDescription:
        'Built with an autonomous supervisor and specialized agent nodes coordinating log anomaly analysis, Prometheus metrics inspection, root-cause synthesis, and human-in-the-loop approved runbook execution. Features strict tool permission boundaries and automated post-incident verification to prevent recursive failure cascades.',
      architectureThemes: [
        'Python',
        'FastAPI',
        'Kubernetes',
        'Prometheus',
        'Grafana',
        'Docker',
        'LangGraph',
        'Controlled Tool Execution',
      ],
      visualScene:
        'A dark technical scene involving infrastructure telemetry, interconnected services and a particle-based network.',
      statusBadge: 'Concept & Prototype',
      githubUrl: 'https://github.com/starcnobucks',
    },
    {
      id: 'mcp-agent-runtime',
      title: 'Session-Aware MCP Agent Runtime',
      tagline: 'State-Sharing & Tool Orchestration Infrastructure',
      description:
        'An agent infrastructure concept for session-scoped state sharing, safe caching of reusable tool results, duplicate-call prevention and more efficient coordination between collaborating agents.',
      detailedDescription:
        'Implements the Model Context Protocol (MCP) with an isolated session-memory layer, idempotent tool request hashing, distributed TTL caching via Redis, and fine-grained access policies to streamline inter-agent messaging and eliminate redundant expensive model tool calls.',
      architectureThemes: [
        'Python',
        'MCP',
        'Redis',
        'Session Management',
        'Tool Orchestration',
        'Caching',
        'Access Control',
        'Observability',
      ],
      visualScene:
        'A technical visualization of agents and tools connected through a shared session layer, with information flowing between nodes.',
      statusBadge: 'Architecture & Spec',
      githubUrl: 'https://github.com/starcnobucks',
    },
    {
      id: 'evidence-agentic-rag',
      title: 'Evidence-Grounded Agentic RAG Platform',
      tagline: 'Traceable Retrieval with Citation Verification & Abstention',
      description:
        'A research assistant designed to retrieve evidence across documents, plan complex searches, verify supporting passages, produce traceable citations and abstain when the available evidence is insufficient.',
      detailedDescription:
        'Features a multi-stage search planner using hybrid dense and sparse embeddings, cross-encoder reranking, claim-to-passage provenance checks, and a calibrated confidence threshold that explicitly abstains or requests clarification rather than hallucinating unsupported facts.',
      architectureThemes: [
        'Python',
        'FastAPI',
        'Hybrid Retrieval',
        'Vector Search',
        'Reranking',
        'ChromaDB / Qdrant',
        'Evaluation',
        'Citation Provenance',
      ],
      visualScene:
        'A knowledge network made of particles, interconnected evidence points and document nodes.',
      statusBadge: 'Active Research Lab',
      githubUrl: 'https://github.com/starcnobucks',
    },
    {
      id: 'synthetic-user-research',
      title: 'Multi-Agent AI User Research Lab',
      tagline: 'Controlled Synthetic Interviews & Persona Feedback Analytics',
      description:
        'A proposed multi-agent research platform for controlled synthetic interviews, simulated user personas, interview planning, qualitative feedback analysis and reports linked to supporting transcript passages.',
      detailedDescription:
        'Note: Designed specifically for exploratory persona simulation and testing interview protocols with synthetic agent participants. Not a substitute for real human customer validation. Generates structured qualitative interview transcripts, thematic clustering, and traceable persona-linked insights.',
      architectureThemes: [
        'Python',
        'FastAPI',
        'Agent Orchestration',
        'Structured Outputs',
        'Evaluation',
        'Research Analytics',
        'React',
      ],
      visualScene:
        'A constellation of agents connected to research insights and participant profiles.',
      statusBadge: 'Synthetic Prototype',
      githubUrl: 'https://github.com/starcnobucks',
    },
    {
      id: 'rymae-multimodal-fashion',
      title: 'Rymae — Adaptive Multimodal Fashion Agent',
      tagline: 'Vision-Language Wardrobe Curation & Contextual Recommendations',
      description:
        'A personalized fashion assistant concept that interprets wardrobe images, remembers user-confirmed preferences, considers occasions and weather, researches fashion trends, and recommends outfit combinations from available garments.',
      detailedDescription:
        'Combines vision-language model segmentation for garment attributes (color palette, cut, fabric, formality) with long-term preference memory and external contextual grounding (weather forecasts, calendar events) to deliver cohesive, personalized outfit suggestions.',
      architectureThemes: [
        'Multimodal AI',
        'Vision-Language Models',
        'Agent Orchestration',
        'Retrieval',
        'Preference Memory',
        'Product Search',
        'React',
      ],
      visualScene:
        'A refined editorial composition of garment silhouettes, outfit combinations and delicate particle transitions.',
      statusBadge: 'Concept & Interface',
      githubUrl: 'https://github.com/starcnobucks',
    },
  ],
  skills: [
    {
      category: 'Agentic AI & Orchestration',
      items: [
        'LangGraph',
        'AutoGen & CrewAI',
        'Supervisor-Worker Workflows',
        'ReAct Reason + Act Loops',
        'Deterministic State Machines',
        'Human-in-the-Loop Gates',
        'Dynamic Tool Dispatching',
      ],
    },
    {
      category: 'LLMs & Generative Models',
      items: [
        'Gemini 2.5 & Flash',
        'Claude 3.7 Sonnet',
        'OpenAI o-Series & GPT-4o',
        'Llama 3 & DeepSeek',
        'Prompt Caching',
        'Structured Outputs & JSON Schema',
        'Function Calling',
      ],
    },
    {
      category: 'RAG & Knowledge Systems',
      items: [
        'Hybrid Retrieval (BM25 + Dense)',
        'Reciprocal Rank Fusion (RRF)',
        'Cross-Encoder Reranking',
        'Hierarchical & Semantic Chunking',
        'Qdrant & ChromaDB',
        'Claim-to-Source Verification',
        'Abstention Calibration',
      ],
    },
    {
      category: 'Model Training & Fine-Tuning',
      items: [
        'LoRA & QLoRA Fine-Tuning',
        'PEFT & HuggingFace Transformers',
        'Unsloth Optimization',
        'Supervised Fine-Tuning (SFT)',
        'DPO Preference Alignment',
        'Custom Tokenization Strategies',
        'GPU Memory & Gradient Checkpointing',
      ],
    },
    {
      category: 'AI Evaluation & Observability',
      items: [
        'LLM-as-a-Judge Evaluation',
        'Ragas RAG Assessment',
        'Tracing via OpenTelemetry & Langfuse',
        'Hallucination & Grounding Detection',
        'Agent Trajectory Unit Testing',
        'Token & Latency Benchmarks',
      ],
    },
    {
      category: 'MLOps & LLMOps',
      items: [
        'Continuous Model Evaluation',
        'Prompt & Dataset Versioning',
        'Automated Eval CI Gates',
        'Model Registries',
        'Experiment Tracking (MLflow/Weights & Biases)',
        'Drift & Performance Monitoring',
      ],
    },
    {
      category: 'Backend & Systems Engineering',
      items: [
        'Python & FastAPI',
        'Go (Golang)',
        'Asynchronous Event Queues',
        'Redis Caching & TTL Management',
        'gRPC & RESTful APIs',
        'PostgreSQL & Cloud SQL',
        'Clean Architecture & Concurrency',
      ],
    },
    {
      category: 'Cloud, DevOps & Model Deployment',
      items: [
        'Kubernetes & AWS EKS',
        'Docker Multi-Stage Builds',
        'vLLM & Triton Inference Serving',
        'GitLab CI/CD & GitHub Actions',
        'Auto-scaling Workloads (KEDA)',
        'Linux System Hardening & Networking',
      ],
    },
  ],
  experience: [
    {
      period: 'August 2025 – January 2026',
      role: 'DevOps Developer Intern',
      organization: 'Tecspeak IT Solutions',
      highlights: [
        'Engineered and maintained GitLab CI/CD pipelines for containerized applications, automating build, testing and deployment workflows.',
        'Contributed to approximately 40% reduction in manual release effort.',
        'Designed and optimized Docker images using multi-stage builds and security scanning.',
        'Worked with containerized services and Kubernetes workloads on AWS EKS.',
        'Gained practical experience in cloud deployments, Linux environments, automation and reliability.',
      ],
    },
  ],
  education: [
    {
      institution: 'KIT College of Engineering',
      location: 'Kolhapur, Maharashtra',
      degree: 'Bachelor of Technology in Computer Science and Business Systems',
      period: '2022–2026',
      score: 'CGPA: 6.00',
    },
    {
      institution: 'Gopikabai Gawande College',
      location: 'Umarkhed, Yavatmal, Maharashtra',
      degree: 'Higher Secondary Certificate — Science (PCMB)',
      period: '2020–2021',
      score: 'Percentage: 89.20%',
    },
  ],
  certifications: [
    {
      title: 'Generative AI Course',
      issuer: 'Krish Naik',
    },
    {
      title: 'Introduction to Kubernetes',
      issuer: 'The Linux Foundation',
    },
    {
      title: 'AWS APAC Solutions Architecture Virtual Experience Program',
      issuer: 'Forage',
    },
  ],
  contact: {
    name: 'Aadesh Kadam',
    email: 'kadamaadesh7249@gmail.com',
    phone: '+91-7249379446',
    phoneDisplay: '+91-7249379446',
    instagram: 'https://www.instagram.com/live_starc/',
    instagramHandle: 'live_starc',
    github: 'https://github.com/starcnobucks',
    githubUsername: 'starcnobucks',
    linkedin: 'https://www.linkedin.com/in/aadesh-kadam-a5830b3a0/',
  },
};
