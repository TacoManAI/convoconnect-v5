[
  {
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "column_default": "uuid_generate_v4()",
    "is_nullable": "NO"
  },
  {
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "column_default": "now()",
    "is_nullable": "NO"
  },
  {
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "column_name": "original_instructions",
    "data_type": "text",
    "character_maximum_length": null,
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "column_name": "simplified_plan_json",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "column_name": "is_active",
    "data_type": "boolean",
    "character_maximum_length": null,
    "column_default": "true",
    "is_nullable": "NO"
  }
]