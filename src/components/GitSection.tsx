import { Button } from "@/components/ui/button";
import { GitHubLogoIcon, CodeIcon, DownloadIcon } from "@radix-ui/react-icons";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

// GitHub repository details
const GITHUB_REPO = "one-ie/one";
const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;
const DOWNLOAD_URL = `${GITHUB_URL}/archive/refs/heads/main.zip`;

export function GitSection() {
  const [stats, setStats] = useState({ stars: 0, forks: 0 });
  const [showCopyMessage, setShowCopyMessage] = useState(false);

  useEffect(() => {
    const fetchGitHubStats = async () => {
      try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`GitHub API responded with status ${response.status}`);
        }

        const data = await response.json();
        if (data && typeof data.stargazers_count === 'number' && typeof data.forks_count === 'number') {
          setStats({
            stars: data.stargazers_count,
            forks: data.forks_count
          });
        } else {
          console.warn('Unexpected GitHub API response format:', data);
        }
      } catch (error) {
        console.error('Error fetching GitHub stats:', error);
        setStats({ stars: 0, forks: 0 });
      }
    };

    fetchGitHubStats();
    const interval = setInterval(fetchGitHubStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const copyCloneCommand = () => {
    navigator.clipboard.writeText(`git clone ${GITHUB_URL}.git`);
    setShowCopyMessage(true);
    setTimeout(() => setShowCopyMessage(false), 2000);
  };

  return (
    <section className="w-full px-4 sm:px-6 py-12">
      <div className="w-full max-w-[1800px] mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Get Started</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose your preferred method to get ONE up and running. Download the ZIP for a quick start, or use Git for full version control and easy updates.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-4">Download ZIP</h3>
              <p className="text-muted-foreground mb-6">
                Get started quickly by downloading the source code directly
              </p>
            </div>
            <div className="flex gap-4">
              <a href={DOWNLOAD_URL} className="flex-1">
                <Button className="w-full" size="lg">
                  <DownloadIcon className="mr-2 h-5 w-5" />
                  Download ZIP
                </Button>
              </a>
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-4">Clone Repository</h3>
              <p className="text-muted-foreground mb-6">
                Clone the repository using Git for full version control
              </p>
            </div>
            <div className="flex gap-4">
              <div className="relative w-full">
                <Button
                  variant="outline"
                  className="flex-1 font-mono text-sm w-full"
                  onClick={copyCloneCommand}
                >
                  <CodeIcon className="mr-2 h-4 w-4" />
                  {GITHUB_REPO}
                </Button>
                <p className={`absolute left-1/2 -translate-x-1/2 mt-2 text-sm text-primary transition-opacity duration-200 ${showCopyMessage ? 'opacity-100' : 'opacity-0'}`}>
                  Copied to clipboard!
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <a href={GITHUB_URL} className="inline-block">
            <Button
              variant="outline"
              size="lg"
              className="group bg-primary/5 hover:bg-primary/10 text-foreground hover:text-foreground"
            >
              <GitHubLogoIcon className="w-[20px] h-[20px] mr-2" />
              <span>View on GitHub</span>
              <div className="ml-2 flex items-center gap-1 px-2 py-0.5 text-sm rounded-full bg-muted">
                <span>{stats.stars}<span className="text-yellow-500">★</span></span>
              </div>
            </Button>
          </a>

          <a href={`${GITHUB_URL}/fork`} className="inline-block">
            <Button
              variant="outline"
              size="lg"
              className="group bg-primary/5 hover:bg-primary/10 text-foreground hover:text-foreground"
            >
              <GitHubLogoIcon className="w-[20px] h-[20px] mr-2" />
              <span>Fork Repository</span>
              <div className="ml-2 flex items-center gap-1 px-2 py-0.5 text-sm rounded-full bg-muted">
                <span>{stats.forks}⑂</span>
              </div>
            </Button>
          </a>

          <a
            href={`https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=${GITHUB_REPO}`}
            className="inline-block"
          >
            <Button
              variant="outline"
              size="lg"
              className="group bg-[#0D1117] hover:bg-[#161B22] border-2 border-[#30363D] hover:border-primary text-white hover:text-white transition-all duration-300"
            >
              <GitHubLogoIcon className="w-[20px] h-[20px] mr-2" />
              <span>Open in Codespaces</span>
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}