import { useState } from 'react';
import { Task, useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Trash2 } from 'lucide-react';

interface TaskCommentDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskCommentDialog({ task, open, onOpenChange }: TaskCommentDialogProps) {
  const [comment, setComment] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const { toast } = useToast();
  const addTaskComment = useStore((state) => state.addTaskComment);
  const deleteTaskComment = useStore((state) => state.deleteTaskComment);
  const teams = useStore((state) => state.teams);
  const currentUser = useStore((state) => state.getCurrentUser());

  // Get all team members from all teams
  const allMembers = teams.flatMap((team) => team.members);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    setComment(value);
    setCursorPosition(position);

    // Check if we should show mentions
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
    if (!comment.trim()) return;

    // Extract mentions from comment
    const mentions = comment.match(/@(\w+)/g)?.map(mention => {
      const username = mention.slice(1);
      const member = allMembers.find(m => m.name === username);
      return member?.id;
    }).filter(Boolean) as string[];

    addTaskComment(task.id, {
      id: crypto.randomUUID(),
      content: comment.trim(),
      authorId: currentUser.id,
      createdAt: new Date().toISOString(),
      mentions,
    });

    toast({
      title: "Success",
      description: "Comment added successfully",
    });

    setComment('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Comments - {task.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="max-h-[400px] overflow-y-auto space-y-4">
            {task.comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              task.comments.map((comment) => {
                const author = allMembers.find((m) => m.id === comment.authorId);
                return (
                  <div key={comment.id} className="flex gap-3 group">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={author?.avatar} />
                      <AvatarFallback>{author?.name[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{author?.name || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        {comment.authorId === currentUser.id && (
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
                      {allMembers.map((member) => (
                        <CommandItem
                          key={member.id}
                          onSelect={() => handleMention(member)}
                          className="flex items-center gap-2"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                          </Avatar>
                          {member.name}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}