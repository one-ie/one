import { Button } from "@/components/ui/button";
import { GitHubLogoIcon, CodeIcon, DownloadIcon } from "@radix-ui/react-icons";
import { Card } from "@/components/ui/card";
// GitHub repository details
const GITHUB_REPO = "one-ie/one";
const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;
const DOWNLOAD_URL = `${GITHUB_URL}/archive/refs/heads/main.zip`;
import { useState, useEffect } from "react";

export function GitSection() {
  const [stats, setStats] = useState({ stars: 0, forks: 0 });
  const [showCopyMessage, setShowCopyMessage] = useState(false);

  useEffect(() => {
    const fetchGitHubStats = async () => {
      try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`);
        const data = await response.json();
        setStats({
          stars: data.stargazers_count,
          forks: data.forks_count
        });
      } catch (error) {
        console.error('Error fetching GitHub stats:', error);
      }
    };

    fetchGitHubStats();
  }, []);

  const copyCloneCommand = () => {
    navigator.clipboard.writeText(`git clone ${GITHUB_URL}.git`);
    setShowCopyMessage(true);
    setTimeout(() => setShowCopyMessage(false), 2000);
  };

  return (
    <section className="container mx-auto px-6 py-20">
      <div className="w-full max-w-[1400px] mx-auto space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Get Started </h2>
          <p className="text-muted-foreground text-lg">Choose how you want to get the code and start building</p>
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
                  one-ie/one
                </Button>
                <p className={`absolute left-1/2 -translate-x-1/2 mt-2 text-sm text-primary transition-opacity duration-200 ${showCopyMessage ? 'opacity-100' : 'opacity-0'}`}>
                  Copied to clipboard!
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-12 space-y-6">
          <h3 className="text-xl font-semibold mb-4">Repository Actions</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href={GITHUB_URL} className="inline-block">
              <Button
                variant="outline"
                size="lg"
                className="group bg-primary/5 hover:bg-primary/10 text-foreground hover:text-foreground"
              >
                <GitHubLogoIcon className="w-5 h-5 mr-2" />
                <span>View on GitHub</span>
                <div className="ml-2 flex items-center gap-1.5 px-2 py-0.5 text-sm rounded-full bg-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-500">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">{stats.stars}</span>
                </div>
              </Button>
            </a>

            <a href={`${GITHUB_URL}/fork`} className="inline-block">
              <Button
                variant="outline"
                size="lg"
                className="group bg-primary/5 hover:bg-primary/10 text-foreground hover:text-foreground"
              >
                <GitHubLogoIcon className="w-5 h-5 mr-2" />
                <span>Fork Repository</span>
                <div className="ml-2 flex items-center gap-1.5 px-2 py-0.5 text-sm rounded-full bg-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-500">
                    <path d="M15 3a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2V5a2 2 0 0 1 2-2h8zm0 2H7v2h8V5zm3 4H6v10h12V9z"/>
                  </svg>
                  <span className="font-semibold">{stats.forks}</span>
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
                <GitHubLogoIcon className="w-5 h-5 mr-2" />
                <span>Open in Codespaces</span>
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}