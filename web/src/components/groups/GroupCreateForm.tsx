import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateGroup, useGroupBySlug } from '@/hooks/useGroups';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  type: z.enum(['friend_circle', 'business', 'community', 'dao', 'government', 'organization']),
  description: z.string().optional(),
  visibility: z.enum(['public', 'private']),
  joinPolicy: z.enum(['open', 'invite_only', 'approval_required']),
});

type FormValues = z.infer<typeof formSchema>;

interface GroupCreateFormProps {
  user: any;
  parentSlug?: string;
}

export function GroupCreateForm({ user, parentSlug }: GroupCreateFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const createGroup = useCreateGroup();

  // If parentSlug provided, fetch parent group
  const { data: parentGroup } = useGroupBySlug(
    parentSlug || null,
    { enabled: !!parentSlug }
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: '',
      name: '',
      type: 'organization',
      description: '',
      visibility: 'private',
      joinPolicy: 'invite_only',
    },
  });

  // Auto-generate slug from name
  const watchName = form.watch('name');
  React.useEffect(() => {
    if (watchName && !form.formState.dirtyFields.slug) {
      const generatedSlug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      form.setValue('slug', generatedSlug, { shouldValidate: false });
    }
  }, [watchName, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const groupId = await createGroup.mutate({
        slug: values.slug,
        name: values.name,
        type: values.type,
        description: values.description,
        parentGroupId: parentGroup?._id,
        settings: {
          visibility: values.visibility,
          joinPolicy: values.joinPolicy,
        },
      });

      toast.success('Group created successfully!');

      // Redirect to group page using safe navigation
      // Validate slug format before redirect to prevent open redirect
      if (/^[a-z0-9-]+$/.test(values.slug)) {
        window.location.href = `/group/${encodeURIComponent(values.slug)}`;
      } else {
        // Fallback to dashboard if slug is invalid
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      console.error('Failed to create group:', error);
      toast.error(error.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {parentGroup && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Parent Group</CardTitle>
              <CardDescription>
                This group will be created as a subgroup of {parentGroup.name}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Give your group a name and URL slug</CardDescription>
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
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">/group/</span>
                      <Input placeholder="my-awesome-group" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Unique URL identifier (auto-generated from name)
                  </FormDescription>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Group Type</CardTitle>
            <CardDescription>Choose what kind of group this is</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="friend_circle">Friend Circle</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="community">Community</SelectItem>
                      <SelectItem value="dao">DAO</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            Create Group
          </Button>
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
