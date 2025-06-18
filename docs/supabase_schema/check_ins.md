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
    "column_name": "care_plan_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "column_name": "pain_level",
    "data_type": "integer",
    "character_maximum_length": null,
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "column_name": "medication_confirmed",
    "data_type": "boolean",
    "character_maximum_length": null,
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "column_name": "emotional_state",
    "data_type": "text",
    "character_maximum_length": null,
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "column_name": "red_flag_check_response",
    "data_type": "text",
    "character_maximum_length": null,
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "column_name": "conversation_transcript",
    "data_type": "text",
    "character_maximum_length": null,
    "column_default": null,
    "is_nullable": "YES"
  }
]