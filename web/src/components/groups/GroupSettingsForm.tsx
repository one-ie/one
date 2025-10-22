import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateGroup, useDeleteGroup } from '@/hooks/useGroups';
import type { Id } from '@/types/convex';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  visibility: z.enum(['public', 'private']),
  joinPolicy: z.enum(['open', 'invite_only', 'approval_required']),
});

type FormValues = z.infer<typeof formSchema>;

interface GroupSettingsFormProps {
  group: {
    _id: Id<'groups'>;
    slug: string;
    name: string;
    type: string;
    description?: string;
    settings: {
      visibility: 'public' | 'private';
      joinPolicy: 'open' | 'invite_only' | 'approval_required';
      plan?: 'starter' | 'pro' | 'enterprise';
    };
  };
  user: any;
}

export function GroupSettingsForm({ group, user }: GroupSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isArchiving, setIsArchiving] = React.useState(false);

  const updateGroup = useUpdateGroup(group._id);
  const deleteGroup = useDeleteGroup(group._id);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: group.name,
      description: group.description || '',
      visibility: group.settings.visibility,
      joinPolicy: group.settings.joinPolicy,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await updateGroup.mutate({
        name: values.name,
        description: values.description,
        settings: {
          visibility: values.visibility,
          joinPolicy: values.joinPolicy,
        },
      });

      toast.success('Group settings updated successfully!');
    } catch (error: any) {
      console.error('Failed to update group:', error);
      toast.error(error.message || 'Failed to update group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      await deleteGroup.mutate();
      toast.success('Group archived successfully');
      window.location.href = '/groups';
    } catch (error: any) {
      console.error('Failed to archive group:', error);
      toast.error(error.message || 'Failed to archive group');
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your group name and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Group" {...field} />
                    </FormControl>
                    <FormDescription>The display name for your group</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell people what this group is about..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">URL Slug</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>/group/</span>
                    <code className="rounded bg-background px-2 py-1">{group.slug}</code>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The URL slug cannot be changed after creation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy & Access</CardTitle>
              <CardDescription>Control who can see and join your group</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Visibility</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="public" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            <div>
                              <p className="font-semibold">Public</p>
                              <p className="text-sm text-muted-foreground">
                                Anyone can see this group
                              </p>
                            </div>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="private" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            <div>
                              <p className="font-semibold">Private</p>
                              <p className="text-sm text-muted-foreground">
                                Only members can see this group
                              </p>
                            </div>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="joinPolicy"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Join Policy</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="open" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            <div>
                              <p className="font-semibold">Open</p>
                              <p className="text-sm text-muted-foreground">
                                Anyone can join instantly
                              </p>
                            </div>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="approval_required" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            <div>
                              <p className="font-semibold">Approval Required</p>
                              <p className="text-sm text-muted-foreground">
                                Members must be approved
                              </p>
                            </div>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="invite_only" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            <div>
                              <p className="font-semibold">Invite Only</p>
                              <p className="text-sm text-muted-foreground">
                                Members must be invited
                              </p>
                            </div>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>

      <Separator />

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that will affect your group permanently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isArchiving}>
                {isArchiving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Archive Group
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will archive the group "{group.name}". The group will no longer be visible
                  to members, but data will be preserved and can be restored later by an
                  administrator.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleArchive} className="bg-destructive">
                  Archive Group
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
