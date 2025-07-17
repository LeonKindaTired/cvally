import { useAuth } from "@/context/authContext";
import { supabase } from "@/supabase/supabase-client";
import { useEffect, useState } from "react";

const UserData = () => {
  const { session } = useAuth();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("protected_table")
        .select("*");

      if (error) console.error(error);
      else setData(data);
    };

    if (session) fetchData();
  }, [session]);

  return <div>{JSON.stringify(data)}</div>;
};

export default UserData;
