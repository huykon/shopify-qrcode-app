import { useCallback, useEffect, useState } from "react";
import {
  reactExtension,
  useApi,
  AdminAction,
  Button,
  TextField,
  Box,
  TextArea,
} from "@shopify/ui-extensions-react/admin";

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = "admin.product-details.action.render";

export default reactExtension(TARGET, () => <App />);

function App() {
  // The useApi hook provides access to several useful APIs like i18n, close, and data.
  const { close, data } = useApi(TARGET);

  const [issue, setIssue] = useState({ title: "", description: "", id: null });
  const [allIssues, setAllIssues] = useState([]);
  const [formErrors, setFormErrors] = useState(null);
  const { title, description, id } = issue;
  const isEditing = id !== null;

  useEffect(() => {
    (async function getProductInfo() {
      // Get the currently selected or displayed product from the 'data' API
      const productData = await getIssues(data.selected[0].id);
      if (productData?.data?.product?.metafield?.value) {
        setAllIssues(JSON.parse(productData.data.product.metafield.value));
      }
    })();
  }, [data.selected]);

  const generateId = () => {
    if (!allIssues.length) {
      return 0;
    }
    return allIssues[allIssues.length - 1].id + 1;
  };

  const validateForm = () => {
    setFormErrors({
      title: !title,
      description: !description,
    });
    return Boolean(title) && Boolean(description);
  };

  const onSubmit = useCallback(async () => {
    if (validateForm()) {
      // Commit changes to the database
      await updateIssues(data.selected[0].id, [
        ...allIssues,
        {
          id: generateId(),
          title,
          description,
          completed: false,
        },
      ]);
      // Close the modal using the 'close' API
      close();
    }
  }, [
    allIssues,
    close,
    data.selected,
    description,
    generateId,
    title,
    validateForm,
  ]);

  return (
    // The UX is defined using components from the @shopify/ui-extensions-react/admin package
    <AdminAction
      title={isEditing ? "Edit your issue" : "Create an issue"}
      primaryAction={
        <Button onPress={onSubmit}>{isEditing ? "Save" : "Create"}</Button>
      }
      secondaryAction={<Button onPress={close}>Cancel</Button>}
    >
      <TextField
        value={title}
        error={formErrors?.title ? "Please enter a title" : undefined}
        onChange={(val) => setIssue((prev) => ({ ...prev, title: val }))}
        label="Title"
      />
      <Box paddingBlockStart="large">
        <TextArea
          value={description}
          error={
            formErrors?.description ? "Please enter a description" : undefined
          }
          onChange={(val) =>
            setIssue((prev) => ({ ...prev, description: val }))
          }
          label="Description"
        />
      </Box>
    </AdminAction>
  );
}

async function updateIssues(id, newIssues) {
  // This example uses metafields to store the data. For more information, refer to https://shopify.dev/docs/apps/custom-data/metafields.
  return await makeGraphQLQuery(
    `mutation SetMetafield($namespace: String!, $ownerId: ID!, $key: String!, $type: String!, $value: String!) {
    metafieldDefinitionCreate(
      definition: {namespace: $namespace, key: $key, name: "Tracked Issues", ownerType: PRODUCT, type: $type, access: {admin: MERCHANT_READ_WRITE}}
    ) {
      createdDefinition {
        id
      }
    }
    metafieldsSet(metafields: [{ownerId:$ownerId, namespace:$namespace, key:$key, type:$type, value:$value}]) {
      userErrors {
        field
        message
        code
      }
    }
  }
  `,
    {
      ownerId: id,
      namespace: "$app:issues",
      key: "issues",
      type: "json",
      value: JSON.stringify(newIssues),
    }
  );
}

async function getIssues(productId) {
  // This example uses metafields to store the data. For more information, refer to https://shopify.dev/docs/apps/custom-data/metafields.
  return await makeGraphQLQuery(
    `query Product($id: ID!) {
      product(id: $id) {
        metafield(namespace: "$app:issues", key:"issues") {
          value
        }
      }
    }
  `,
    { id: productId }
  );
}

async function makeGraphQLQuery(query, variables) {
  const graphQLQuery = {
    query,
    variables,
  };

  const res = await fetch("shopify:admin/api/graphql.json", {
    method: "POST",
    body: JSON.stringify(graphQLQuery),
  });

  if (!res.ok) {
    console.error("Network error");
  }

  return await res.json();
}
