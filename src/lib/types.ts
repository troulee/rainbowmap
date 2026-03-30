export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
        };
        Update: {
          username?: string;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      photos: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;
          thumbnail_url: string | null;
          latitude: number;
          longitude: number;
          compass_direction: number | null;
          taken_at: string;
          description: string | null;
          vote_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_url: string;
          thumbnail_url?: string | null;
          latitude: number;
          longitude: number;
          compass_direction?: number | null;
          taken_at: string;
          description?: string | null;
        };
        Update: {
          image_url?: string;
          thumbnail_url?: string | null;
          latitude?: number;
          longitude?: number;
          compass_direction?: number | null;
          taken_at?: string;
          description?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "photos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      votes: {
        Row: {
          user_id: string;
          photo_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          photo_id: string;
        };
        Update: {
          user_id?: string;
          photo_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "votes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "votes_photo_id_fkey";
            columns: ["photo_id"];
            isOneToOne: false;
            referencedRelation: "photos";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Photo = Database["public"]["Tables"]["photos"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type PhotoWithProfile = Photo & { profiles: Pick<Profile, "username" | "avatar_url"> };
