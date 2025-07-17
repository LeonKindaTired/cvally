import { supabase } from "@/supabase/supabase-client";
import { useEffect, useState } from "react";
import {
  FileText,
  Briefcase,
  Building,
  Calendar,
  Trash2,
  Loader2,
  Search,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import { format } from "date-fns";

const UserLetters = () => {
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLetters = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from("cover_letters")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (searchTerm) {
          query = query
            .ilike("title", `%${searchTerm}%`)
            .ilike("job_title", `%${searchTerm}%`)
            .ilike("company", `%${searchTerm}%`);
        }

        const { data, error } = await query;

        if (error) throw error;
        setLetters(data || []);
      } catch (error: any) {
        toast.error(`Error loading letters: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchLetters();
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("cover_letters")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setLetters(letters.filter((letter) => letter.id !== id));
      toast.success("Cover letter deleted successfully");
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy 'at' h:mm a");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Cover Letters</h1>
          <div className="w-64">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((id) => (
            <Card key={id} className="h-52">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5" />
              </CardContent>
              <CardFooter className="justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Cover Letters</h1>
          <p className="text-muted-foreground">
            {letters.length} saved {letters.length === 1 ? "letter" : "letters"}
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search letters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {letters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No cover letters yet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Your saved cover letters will appear here. Generate one to get
            started!
          </p>
          <Button onClick={() => (window.location.href = "/")}>
            Create Cover Letter
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {letters.map((letter) => (
            <Card
              key={letter.id}
              className="flex flex-col h-full hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <CardTitle className="line-clamp-1 text-lg">
                  {letter.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(letter.created_at)}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{letter.job_title}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{letter.company}</span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground line-clamp-3">
                  {letter.content}
                </div>
              </CardContent>

              <CardFooter className="flex justify-between border-t pt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">View</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">
                        {letter.title}
                      </DialogTitle>
                      <DialogDescription className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          <span>{letter.job_title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          <span>{letter.company}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(letter.created_at)}</span>
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg mt-4">
                      {letter.content}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(letter.id)}
                        disabled={deletingId === letter.id}
                      >
                        {deletingId === letter.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete
                      </Button>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(letter.content);
                          toast.success("Cover letter copied to clipboard!");
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Content
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(letter.id)}
                  disabled={deletingId === letter.id}
                >
                  {deletingId === letter.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserLetters;
