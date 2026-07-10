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
      reports: {
        Row: {
          id: string;
          user_id: string;
          upload_batch_id: string;
          status: string;
          currency: string;
          gross_sales: number;
          refunds: number;
          fees: number;
          ads: number;
          shipping: number;
          tax_collected: number;
          net_profit_before_cogs: number;
          net_profit_after_cogs: number;
          warnings_json: Json;
          completeness_status: string;
          included_file_types_json: Json;
          missing_file_types_json: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          upload_batch_id: string;
          status?: string;
          currency?: string;
          gross_sales?: number;
          refunds?: number;
          fees?: number;
          ads?: number;
          shipping?: number;
          tax_collected?: number;
          net_profit_before_cogs?: number;
          net_profit_after_cogs?: number;
          warnings_json?: Json;
          completeness_status?: string;
          included_file_types_json?: Json;
          missing_file_types_json?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          upload_batch_id?: string;
          status?: string;
          currency?: string;
          gross_sales?: number;
          refunds?: number;
          fees?: number;
          ads?: number;
          shipping?: number;
          tax_collected?: number;
          net_profit_before_cogs?: number;
          net_profit_after_cogs?: number;
          warnings_json?: Json;
          completeness_status?: string;
          included_file_types_json?: Json;
          missing_file_types_json?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_upload_batch_id_fkey";
            columns: ["upload_batch_id"];
            isOneToOne: false;
            referencedRelation: "upload_batches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      download_events: {
        Row: {
          id: string;
          user_id: string;
          report_id: string;
          file_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          report_id: string;
          file_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          report_id?: string;
          file_type?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "download_events_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "download_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      waitlist_submissions: {
        Row: {
          id: string;
          email: string;
          interest: string;
          source_page: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          interest: string;
          source_page: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          interest?: string;
          source_page?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      feedback_submissions: {
        Row: {
          id: string;
          user_id: string | null;
          email: string | null;
          topic: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email?: string | null;
          topic: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          email?: string | null;
          topic?: string;
          message?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_submissions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
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
          rows_json: Json;
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
          rows_json?: Json;
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
          rows_json?: Json;
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
