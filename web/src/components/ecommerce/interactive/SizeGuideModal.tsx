/**
 * Size Guide Modal Component
 * Detailed measurement guide and size recommendations
 * Requires client:load hydration
 */

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SizeGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productType?: 'apparel' | 'shoes' | 'accessories';
}

// Size data for different product types
const apparelSizes = [
  { size: 'XS', chest: '30-32', waist: '24-26', hips: '33-35', length: '27' },
  { size: 'S', chest: '32-34', waist: '26-28', hips: '35-37', length: '27.5' },
  { size: 'M', chest: '34-36', waist: '28-30', hips: '37-39', length: '28' },
  { size: 'L', chest: '36-38', waist: '30-32', hips: '39-41', length: '28.5' },
  { size: 'XL', chest: '38-40', waist: '32-34', hips: '41-43', length: '29' },
  { size: '2XL', chest: '40-42', waist: '34-36', hips: '43-45', length: '29.5' },
];

const shoeSizes = [
  { us: '6', uk: '3.5', eu: '36', cm: '22.5' },
  { us: '7', uk: '4.5', eu: '37', cm: '23.5' },
  { us: '8', uk: '5.5', eu: '38', cm: '24.5' },
  { us: '9', uk: '6.5', eu: '39', cm: '25.5' },
  { us: '10', uk: '7.5', eu: '40', cm: '26.5' },
  { us: '11', uk: '8.5', eu: '41', cm: '27.5' },
  { us: '12', uk: '9.5', eu: '42', cm: '28.5' },
];

export function SizeGuideModal({
  open,
  onOpenChange,
  productType = 'apparel',
}: SizeGuideModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Size Guide</DialogTitle>
          <DialogDescription>
            Find your perfect fit with our detailed measurement guide
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="measurements" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="measurements">Measurements</TabsTrigger>
            <TabsTrigger value="how-to">How to Measure</TabsTrigger>
            <TabsTrigger value="fit">Fit Guide</TabsTrigger>
          </TabsList>

          {/* Size Measurements Tab */}
          <TabsContent value="measurements" className="space-y-4">
            {productType === 'apparel' && (
              <>
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-semibold mb-3">Size Chart (inches)</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Size</TableHead>
                          <TableHead>Chest</TableHead>
                          <TableHead>Waist</TableHead>
                          <TableHead>Hips</TableHead>
                          <TableHead>Length</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apparelSizes.map((row) => (
                          <TableRow key={row.size}>
                            <TableCell className="font-medium">{row.size}</TableCell>
                            <TableCell>{row.chest}</TableCell>
                            <TableCell>{row.waist}</TableCell>
                            <TableCell>{row.hips}</TableCell>
                            <TableCell>{row.length}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <h4 className="text-sm font-semibold mb-2">Model Stats</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Height: 5'9" / 175 cm</li>
                    <li>Chest: 34" / 86 cm</li>
                    <li>Waist: 28" / 71 cm</li>
                    <li>Hips: 37" / 94 cm</li>
                    <li>Wearing size: Medium</li>
                  </ul>
                </div>
              </>
            )}

            {productType === 'shoes' && (
              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold mb-3">Shoe Size Conversion</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>US</TableHead>
                        <TableHead>UK</TableHead>
                        <TableHead>EU</TableHead>
                        <TableHead>CM</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shoeSizes.map((row) => (
                        <TableRow key={row.us}>
                          <TableCell className="font-medium">{row.us}</TableCell>
                          <TableCell>{row.uk}</TableCell>
                          <TableCell>{row.eu}</TableCell>
                          <TableCell>{row.cm}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* How to Measure Tab */}
          <TabsContent value="how-to" className="space-y-4">
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold mb-3">Taking Your Measurements</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <h4 className="font-medium text-foreground mb-1">1. Chest</h4>
                    <p>
                      Measure around the fullest part of your chest, keeping the tape
                      measure horizontal and comfortable.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">2. Waist</h4>
                    <p>
                      Measure around your natural waistline, keeping the tape snug but
                      not tight.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">3. Hips</h4>
                    <p>
                      Measure around the fullest part of your hips, approximately 8
                      inches below your waist.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">4. Length</h4>
                    <p>
                      Measure from the highest point of your shoulder to your desired
                      garment length.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4">
                <div className="flex gap-2">
                  <svg
                    className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Pro Tip
                    </h4>
                    <p className="text-blue-800 dark:text-blue-200">
                      For best results, ask someone to help you take measurements. Wear
                      fitted clothing or undergarments and keep the tape measure level.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Fit Guide Tab */}
          <TabsContent value="fit" className="space-y-4">
            <div className="space-y-3">
              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold mb-2">Regular Fit</h3>
                <p className="text-sm text-muted-foreground">
                  Comfortable, classic cut with room to move. Not too tight or loose.
                  Perfect for everyday wear.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold mb-2">Slim Fit</h3>
                <p className="text-sm text-muted-foreground">
                  Tailored closer to the body for a modern, streamlined look. More
                  fitted through chest and waist.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold mb-2">Relaxed Fit</h3>
                <p className="text-sm text-muted-foreground">
                  Looser, more comfortable fit with extra room throughout. Ideal for
                  casual, laid-back style.
                </p>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <h4 className="text-sm font-semibold mb-2">Between Sizes?</h4>
                <p className="text-sm text-muted-foreground">
                  If you're between sizes, we recommend sizing up for a more comfortable
                  fit, or sizing down if you prefer a tighter fit. Check customer reviews
                  for fit feedback.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
