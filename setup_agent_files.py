import shutil

shutil.copyfile('frontend/src/components/agent/OxooAgentWidget.jsx', 'frontend/src/components/agent/PrimeProAgentWidget.jsx')
shutil.copyfile('frontend/src/components/agent/oxoo-agent.css', 'frontend/src/components/agent/primepro-agent.css')

with open('frontend/src/components/agent/PrimeProAgentWidget.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("import './oxoo-agent.css';", "import './primepro-agent.css';")
with open('frontend/src/components/agent/PrimeProAgentWidget.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

with open('frontend/src/components/agent/OxooAgentWidget.jsx', 'w', encoding='utf-8') as f:
    f.write("export { default } from './PrimeProAgentWidget';\nexport * from './PrimeProAgentWidget';\n")

print("Created PrimeProAgentWidget.jsx and primepro-agent.css successfully!")
