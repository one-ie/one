This is the plan to get the complete system working

Everything works

npx oneie
claude
/one

now we need to optimise the .claude/commands/one.md

first check if there is a /web directory ... no there isn't it's called /frontend we need to edit the /cli script to change the downloaded system to clone into /web not frontend and update all references to frontend to point to web

then check if the server is running. if not offer to start i.e. cd web && bun dev

also you are not copying /.mcp.json to /apps/one/.mcp json update releease script

also the cli should create a new folder for the group name filled in the cli
