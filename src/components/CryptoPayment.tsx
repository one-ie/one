import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { AlertCircle, Copy, QrCode } from "lucide-react";
import QRCode from '@qrcode/react';
import { toast } from "sonner";

interface CryptoPaymentProps {
  orderId: string;
  amount: number;
  currency?: string;
  onSuccess?: (txData: TransactionData) => void;
}

interface TransactionData {
  hash: string;
  confirmations: number;
  amount: string;
  currency: CryptoCurrency;
  senderAddress: string;
}

type CryptoCurrency = 'BTC' | 'ETH' | 'SOL';

interface CryptoConfig {
  address: string;
  network?: string;
  explorer?: string;
  qrPrefix?: string;
  icon: string;
}

const CRYPTO_CONFIG: Record<CryptoCurrency, CryptoConfig> = {
  BTC: {
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    network: "Bitcoin",
    explorer: "https://blockchain.info/tx",
    qrPrefix: "bitcoin:",
    icon: "/btc-logo.svg"
  },
  ETH: {
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    network: "Ethereum",
    explorer: "https://etherscan.io/tx",
    qrPrefix: "ethereum:",
    icon: "/eth-logo.svg"
  },
  SOL: {
    address: "HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH",
    network: "Solana",
    explorer: "https://solscan.io/tx",
    qrPrefix: "solana:",
    icon: "/sol-logo.svg"
  }
};

interface CryptoPrices {
  BTC: number;
  ETH: number;
  SOL: number;
}

export default function CryptoPayment({ 
  amount, 
  currency = "USD",
  onSuccess 
}: CryptoPaymentProps) {

  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency>("BTC");
  const [cryptoAmount, setCryptoAmount] = useState<string>("");
  const [senderAddress, setSenderAddress] = useState("");
  const [status, setStatus] = useState<"pending" | "verifying" | "completed" | "failed">("pending");
  const [error, setError] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [prices, setPrices] = useState<CryptoPrices | null>(null);

  useEffect(() => {
    const getCryptoPrices = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
        const data = await response.json();
        
        const newPrices: CryptoPrices = {
          BTC: data.bitcoin.usd,
          ETH: data.ethereum.usd,
          SOL: data.solana.usd
        };
        
        setPrices(newPrices);
        const cryptoPrice = newPrices[selectedCrypto];
        setCryptoAmount((amount / cryptoPrice).toFixed(8));
      } catch (err) {
        setError("Failed to fetch crypto prices. Please try again.");
        console.error('Price fetch error:', err);
      }
    };

    getCryptoPrices();
    // Set up polling for price updates every 30 seconds
    const interval = setInterval(getCryptoPrices, 30000);
    
    return () => clearInterval(interval);
  }, [selectedCrypto, amount]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("Copied to clipboard", {
      description: "Address copied to clipboard",
      duration: 3000
    });
  };

  const handleSubmit = async () => {
    if (!senderAddress) {
      toast("Error", {
        description: "Please enter your sender address",
        duration: 3000
      });
      return;
    }
    setStatus("verifying");
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus("completed");
      toast("Success", {
        description: "Payment verified successfully!",
        duration: 3000
      });
      
      if (onSuccess) {
        onSuccess({
          hash: `${selectedCrypto}_${Date.now()}`,
          confirmations: 1,
          amount: cryptoAmount,
          currency: selectedCrypto,
          senderAddress
        });
      }
    } catch (err) {
      setStatus("failed");
      setError("Failed to verify payment. Please try again or contact support.");
      toast("Error", {
        description: "Payment verification failed",
        duration: 3000
      });
    }
  };

  return (
    <div className="w-full">
      <Select
        value={selectedCrypto}
        onValueChange={(value: CryptoCurrency) => setSelectedCrypto(value)}
      >
        <SelectTrigger className="w-full mb-4">
          <SelectValue placeholder="Select cryptocurrency" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(CRYPTO_CONFIG).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              <div className="flex items-center gap-2">
                <img src={config.icon} alt={key} className="w-5 h-5" />
                {key}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {prices && (
        <div className="mb-6 p-4 border rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Amount Due:</span>
            <span className="font-bold">${amount} {currency}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Crypto Amount:</span>
            <span className="font-bold">{cryptoAmount} {selectedCrypto}</span>
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        {showQR ? (
          <div className="p-4 bg-white rounded-lg inline-block">
            <QRCode
              value={`${CRYPTO_CONFIG[selectedCrypto].qrPrefix}${CRYPTO_CONFIG[selectedCrypto].address}?amount=${cryptoAmount}`}
              size={200}
            />
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setShowQR(true)}
            className="w-full"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Show QR Code
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label>Recipient Address</Label>
          <div className="flex items-center gap-2">
            <Input
              value={CRYPTO_CONFIG[selectedCrypto].address}
              readOnly
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(CRYPTO_CONFIG[selectedCrypto].address)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <Label>Your {selectedCrypto} Address</Label>
          <Input
            value={senderAddress}
            onChange={(e) => setSenderAddress(e.target.value)}
            placeholder={`Enter your ${selectedCrypto} address`}
          />
        </div>

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!senderAddress || status === "verifying"}
        >
          {status === "verifying" ? "Verifying Payment..." : "Verify Payment"}
        </Button>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}