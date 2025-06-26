const settings = input.config({
  title: “Update Field Descriptions”,
  description:
    “Select a table and have an LLM (OpenAI) create your field descriptions for you.  It will pull the a handful of records from the base and use those as a refrence for what data is in the fields.  Scripting doesn’t let us examine formula code.  Requires an OpenAI API Key and uses gpt-4.1-mini (you can change in the source code)“,
  items: [
    input.config.table(“table”, {
      label: “Table”,
      description: “Table whose descriptions you want to update”,
    }),
    input.config.select(‘all_fields’, {
        label: ‘Overwrite existing’,
        description: ‘If yes, will update for all fields even if they have a description.  If no only do this for net new fields.  Default is only net new’,
        options: [
            {label: ‘No’, value: “false”},
            {label: ‘Yes’, value: ‘true’}
        ]
    }),
  ]
});
// model name
const MODEL_NAME=‘gpt-4.1-mini’
// having the user enter it one time avoids needing to store the API key in the base for anyone to see.
// Annoying, yes, but safest option from our experience
const OPENAI_API_KEY = await input.textAsync(“Enter your OpenAI API key”);
// some fields have more data about them than others
// we can use this function to extract that information
// right now, this only pulls in single/multi select options and the table that a linked record links to
// but it could be expanded to also include details about other computed fields
function getFieldOptions(field) {
  if (field.type === “singleSelect” || field.type === “multipleSelects”) {
    return field.options.choices
      .map((i) => {
        return i.name;
      })
      .join(“, “);
  } else if (field.type === “multipleRecordLinks”) {
    return base.getTable(field.options.linkedTableId).name;
  } else if(field.type == “formula”) {
    // formulas are weird.  You can get the fields it references which is helpful, but not much else
    const names = field.options.referencedFieldIds
    .map((id) => {
      try {
        const refField = settings.table.getField(id);
        return refField ? refField.name : null;
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);
    return `References: ${names.length > 0 ? names.join(“, “) : “No fields referenced”}.  Returns: ${field.options.result.type}`;
  }
  return null;
}
// load records out of the table and build a map
// of existing records using their key
const results = await settings.table.selectRecordsAsync();
const sample_records = results.records.slice(5);
// iterate through each field in table
// create make the request to OpenAI to create the field description
// update description
function create_prompt(table, field, records) {
  let options = getFieldOptions(field);
  let values = records.map(r => r.getCellValueAsString(field.id)).join(“, “);
  return `You are a data documentation assistant helping annotate Airtable fields for API and AI agent usage.
Write a clear, one-sentence description for a field in a dataset, following these rules:
- Do not include the field name in the sentence.
- Describe what the field contains and how it’s used.
- Mention business context or usage if it improves clarity.
- Use sentence case and professional tone.
- Output only the description.
Table Name: ${table.name}
Field Name: ${field.name}
Field Type: ${field.type}
Field Metadata: ${options || “None”}
Sample Values: ${values}
`
}
// iterate over all fields in the selected table
for (let f of settings.table.fields) {
    // check if there’s an existing description
    if (!f.description || settings.all_fields === “true”) {
        output.markdown(`Creating field description for ${f.name}`)
        let prompt = create_prompt(settings.table, f, sample_records)
        // send request to openai
        const response = await fetch(“https://api.openai.com/v1/responses”, {
            method: “POST”,
            headers: {
                “Authorization”: `Bearer ${OPENAI_API_KEY}`,
                “Content-Type”: “application/json”,
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                input: prompt
            }),
        });
        if (!response.ok) {
            output.markdown(`:x: Failed for field: **${f.name}**`);
            continue;
        }
        const json = await response.json();
        const result = json.output[0].content[0].text.trim();
        // update field description
        // Update field meta
        await f.updateDescriptionAsync(result)
        output.markdown(`:white_check_mark: Updated: **${f.name}** with description ${result}`);
    }
    else {
        output.markdown(`:black_right_pointing_double_triangle_with_vertical_bar: Skipped: **${f.name}**`);
    }
}
output.markdown(“**Done**“);
