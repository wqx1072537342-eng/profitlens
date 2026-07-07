export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      upload_batches: {
        Row: {
          id: string;
          user_id: string;
          reporting_year: number | null;
          status: string;
          file_count: number;
          warning_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          reporting_year?: number | null;
          status?: string;
          file_count?: number;
          warning_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          reporting_year?: number | null;
          status?: string;
          file_count?: number;
          warning_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "upload_batches_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      uploads: {
        Row: {
          id: string;
          user_id: string;
          upload_batch_id: string;
          file_name: string;
          file_type: string;
          file_size_bytes: number;
          row_count: number;
          status: string;
          storage_path: string | null;
          headers_json: Json;
          preview_rows_json: Json;
          warnings_json: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          upload_batch_id: string;
          file_name: string;
          file_type?: string;
          file_size_bytes?: number;
          row_count?: number;
          status?: string;
          storage_path?: string | null;
          headers_json?: Json;
          preview_rows_json?: Json;
          warnings_json?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          upload_batch_id?: string;
          file_name?: string;
          file_type?: string;
          file_size_bytes?: number;
          row_count?: number;
          status?: string;
          storage_path?: string | null;
          headers_json?: Json;
          preview_rows_json?: Json;
          warnings_json?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "uploads_upload_batch_id_fkey";
            columns: ["upload_batch_id"];
            isOneToOne: false;
            referencedRelation: "upload_batches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "uploads_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
