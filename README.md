# Airtable Field Descriptions Generator
[Yes... this is entirely LLM generated.  Thanks Claude.]

Automatically generate clear, professional field descriptions for your Airtable bases using OpenAI's GPT-4 model. This Airtable script examines your table data and creates contextual descriptions for each field, making your bases more documentation-friendly and AI-agent ready.

## Features

- **Smart Field Analysis**: Examines field types, options, and sample data to generate accurate descriptions
- **Selective Updates**: Choose to update only fields without descriptions or overwrite all existing descriptions
- **Context-Aware**: Uses sample records to understand field usage and content patterns
- **Professional Output**: Generates clear, one-sentence descriptions in professional tone
- **Safe API Key Handling**: Prompts for API key each time to avoid storing sensitive credentials

## Prerequisites

- Airtable Pro plan or higher (required for scripting)
- OpenAI API key with access to GPT-4 models
- JavaScript knowledge for customization (optional)

## Installation

1. Open your Airtable base
2. Navigate to Extensions → Scripting
3. Create a new script
4. Copy and paste the contents of `main.js` into the script editor
5. Click "Run" to start the script

## Usage

1. **Select Table**: Choose which table you want to generate descriptions for
2. **Choose Update Mode**:
   - **No**: Only update fields that don't have descriptions (recommended)
   - **Yes**: Overwrite all field descriptions, including existing ones
3. **Enter API Key**: Provide your OpenAI API key when prompted
4. **Wait for Processing**: The script will process each field and display progress

## Sample Output

The script generates descriptions like:
- `email` field: "Contains customer email addresses for communication and account identification"
- `priority` field: "Indicates task priority level using High, Medium, or Low classifications"
- `due_date` field: "Specifies the deadline for task completion"

## Configuration

### Model Settings
By default, the script uses `gpt-4.1-mini`. To change the model, modify this line:
```javascript
const MODEL_NAME = 'gpt-4.1-mini'
```

### Field Type Support
Currently extracts metadata for:
- Single/Multiple Select fields (includes available options)
- Linked Record fields (includes target table name)
- All other field types (uses sample values for context)

## Security Notes

- API keys are requested at runtime and not stored in your base
- Only a small sample of records (5) is sent to OpenAI for context
- No sensitive data beyond field names, types, and sample values is transmitted

## Limitations

- Cannot examine formula code due to Airtable scripting restrictions
- Requires manual API key entry for each run
- Uses a fixed sample size of 5 records for analysis.  You can modify this but I don't think it's necessary
- Depends on OpenAI API availability and rate limits

## Error Handling

If a field description generation fails:
- The script will display an error message with ❌
- Processing continues with remaining fields
- Successfully updated fields show ✅
- Skipped fields (with existing descriptions) show ⏭️

## Customization

### Extending Field Analysis
To support additional field types, modify the `getFieldOptions()` function:

```javascript
function getFieldOptions(field) {
  // Add new field type handling here
  if (field.type === "yourFieldType") {
    return "custom metadata";
  }
  // existing code...
}
```

### Modifying the Prompt
Customize the description style by editing the `create_prompt()` function to adjust the instructions sent to OpenAI.

## Cost Considerations

- Uses OpenAI's API which incurs costs based on token usage
- GPT-4.1-mini is cost-effective for this use case
- Typical cost per field description is minimal
