# GenerateDocumentRequest

Request payload for generating a document based on a template.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**template_id** | **number** |  | [default to undefined]
**tender_id** | **number** |  | [default to undefined]
**attribute_values** | **object** |  | [optional] [default to undefined]
**output_formats** | **Array&lt;string&gt;** |  | [optional] [default to undefined]

## Example

```typescript
import { GenerateDocumentRequest } from '@tenderflow/api-client';

const instance: GenerateDocumentRequest = {
    template_id,
    tender_id,
    attribute_values,
    output_formats,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
