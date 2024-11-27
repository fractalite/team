import { useState } from 'react';
import { Task, useStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar, MessageSquare, User, Trash2 } from 'lucide-react';

interface TaskDetailDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
  const [comment, setComment] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const { toast } = useToast();
  const addTaskComment = useStore((state) => state.addTaskComment);
  const deleteTaskComment = useStore((state) => state.deleteTaskComment);
  const teams = useStore((state) => state.teams);
  const profile = useStore((state) => state.profile);

  const allMembers = teams
    .filter(team => team && team.members)
    .flatMap(team => team.members || [])
    .filter((member, index, self) => 
      // Remove duplicates by user_id
      index === self.findIndex((m) => m.user_id === member.user_id)
    );

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    setComment(value);
    setCursorPosition(position);

    const lastChar = value.charAt(position - 1);
    if (lastChar === '@') {
      setMentionOpen(true);
    } else if (lastChar === ' ' || value === '') {
      setMentionOpen(false);
    }
  };

  const handleMention = (member: { id: string; name: string }) => {
    const before = comment.slice(0, cursorPosition);
    const after = comment.slice(cursorPosition);
    const lastAtPos = before.lastIndexOf('@');
    const newComment = before.slice(0, lastAtPos) + `@${member.name} ` + after;
    setComment(newComment);
    setMentionOpen(false);
  };

  const handleDeleteComment = (commentId: string) => {
    deleteTaskComment(task.id, commentId);
    toast({
      title: "Success",
      description: "Comment deleted successfully",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !profile) return;

    const mentions = comment.match(/@(\w+)/g)?.map(mention => {
      const username = mention.slice(1);
      const member = allMembers.find(m => m.profile?.full_name === username);
      return member?.user_id;
    }).filter(Boolean) as string[];

    addTaskComment(task.id, {
      id: crypto.randomUUID(),
      content: comment.trim(),
      task_id: task.id,
      author_id: profile.id,
      mentions: mentions || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    toast({
      title: "Success",
      description: "Comment added successfully",
    });

    setComment('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="comments" className="flex-1 overflow-hidden">
          <TabsList>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments ({task.comments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 overflow-auto">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">{task.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Created</h4>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {task.created_at ? format(new Date(task.created_at), 'PPP') : 'Not available'}
                </p>
              </div>

              {task.due_date && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Due Date</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {task.due_date ? format(new Date(task.due_date), 'PPP') : 'Not available'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="mt-4 space-y-4 overflow-auto">
            <div className="space-y-4">
              {task.comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                task.comments.map((comment) => {
                  const author = allMembers.find((m) => m.user_id === comment.author_id);
                  return (
                    <div key={comment.id} className="flex gap-3 group">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={author?.profile?.avatar} />
                        <AvatarFallback>{author?.profile?.full_name[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{author?.profile?.full_name || 'Unknown'}</span>
                            <span className="text-xs text-muted-foreground">
                              {comment.created_at ? format(new Date(comment.created_at), 'MMM d, yyyy h:mm a') : 'Unknown date'}
                            </span>
                          </div>
                          {comment.author_id === profile?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <Separator />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Textarea
                  value={comment}
                  onChange={handleCommentChange}
                  placeholder="Write a comment... Use @ to mention team members"
                  className="min-h-[100px]"
                />
                <Popover open={mentionOpen} onOpenChange={setMentionOpen}>
                  <PopoverTrigger className="hidden" />
                  <PopoverContent className="p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search team members..." />
                      <CommandEmpty>No members found.</CommandEmpty>
                      <CommandGroup>
                        {allMembers
                          .filter(member => member && member.profile)
                          .map((member) => (
                            <CommandItem
                              key={member.user_id}
                              onSelect={() => handleMention({
                                id: member.user_id,
                                name: member.profile?.full_name || 'Unknown'
                              })}
                              className="flex items-center gap-2"
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={member.profile?.avatar_url} />
                                <AvatarFallback>{(member.profile?.full_name || 'U')[0]}</AvatarFallback>
                              </Avatar>
                              {member.profile?.full_name || 'Unknown User'}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={!comment.trim()}>
                  Add Comment
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}