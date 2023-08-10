import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  render,
  extend,
  Text,
  Card,
  useData,
  TextField,
  InlineStack,
  useContainer,
  useSessionToken,
  Button,
  BlockStack,
  TextBlock,
  Checkbox,
} from "@shopify/admin-ui-extensions-react";

// Your extension must render all four modes
extend(
  "Admin::Product::SubscriptionPlan::Add",
  render(() => <Add />)
);

extend(
  "Admin::Product::SubscriptionPlan::Create",
  render(() => <Create />)
);

extend(
  "Admin::Product::SubscriptionPlan::Remove",
  render(() => <Remove />)
);
extend(
  "Admin::Product::SubscriptionPlan::Edit",
  render(() => <Edit />)
);

// 'Add' mode should allow a user to add the current product to an existing selling plan
// [Shopify admin renders this mode inside a modal container]
const Add = () => {
  const data = useData();
  const { close, done, setPrimaryAction, setSecondaryAction } = useContainer();
  const { getSessionToken } = useSessionToken();

  const [selectedPlans, setSelectedPlans] = useState([]);
  const mockPlans = [
    { name: "Subscription Plan A", id: "a" },
    { name: "Subscription Plan B", id: "b" },
    { name: "Subscription Plan C", id: "c" },
  ];

  // Configure the extension container UI
  useEffect(() => {
    setPrimaryAction({
      content: "Add to plan",
      onAction: async () => {
        // Get a fresh session token before every call to your app server.
        /* const token = */ await getSessionToken();

        // Here, send the form data to your app server to add the product to an existing plan.

        // Upon completion, call done() to trigger a reload of the resource page
        // and terminate the extension.
        done();
      },
    });

    setSecondaryAction({
      content: "Cancel",
      onAction: () => close(),
    });
  }, [getSessionToken, close, done, setPrimaryAction, setSecondaryAction]);

  return (
    <>
      <TextBlock size="extraLarge">Hey!</TextBlock>
      <Text>
        Add Product id {data.productId} to an existing plan or existing plans
      </Text>

      <InlineStack>
        {mockPlans.map((plan) => (
          <Checkbox
            key={plan.id}
            label={plan.name}
            onChange={(checked) => {
              const plans = checked
                ? selectedPlans.concat(plan.id)
                : selectedPlans.filter((id) => id !== plan.id);
              setSelectedPlans(plans);
            }}
            checked={selectedPlans.includes(plan.id)}
          />
        ))}
      </InlineStack>
    </>
  );
};

const Create = () => {
  const data = useData();
  const { close, done } = useContainer();

  const { getSessionToken } = useSessionToken();

  const [planTitle, setPlanTitle] = useState<string>("");
  const [deliveryFrequency, setDeliveryFrequency] = useState<string>("");
  const [percentageOff, setPercentageOff] = useState<string>("");

  const onPrimaryAction = useCallback(async () => {
    /* const token = */ await getSessionToken();

    // Here, send the form data to your app server to create the new plan.

    done();
  }, [getSessionToken, done]);

  const cachedActions = useMemo(
    () => (
      <Actions
        onPrimary={onPrimaryAction}
        onClose={close}
        title="Create plan"
      />
    ),
    [onPrimaryAction, close]
  );

  return (
    <>
      <BlockStack spacing="none">
        <TextBlock size="extraLarge">Hello! Create subscription plan</TextBlock>
      </BlockStack>

      <Card
        title={`Create subscription plan for Product id ${data.productId}`}
        sectioned
      >
        <TextField
          label="Plan title"
          value={planTitle}
          onChange={setPlanTitle}
        />
      </Card>
      <Card title="Delivery and discount" sectioned>
        <InlineStack>
          <TextField
            type="number"
            label="Delivery frequency (in weeks)"
            value={deliveryFrequency}
            onChange={setDeliveryFrequency}
          />
          <TextField
            type="number"
            label="Percentage off (%)"
            value={percentageOff}
            onChange={setPercentageOff}
          />
        </InlineStack>
      </Card>
      {cachedActions}
    </>
  );
};

// 'Remove' mode should remove the current product from a selling plan.
// This should not delete the selling plan.
// [Shopify admin renders this mode inside a modal container]
const Remove = () => {
  const data = useData();
  const { close, done, setPrimaryAction, setSecondaryAction } = useContainer();
  const { getSessionToken } = useSessionToken();

  useEffect(() => {
    setPrimaryAction({
      content: "Remove from plan",
      onAction: async () => {
        /* const token = */ await getSessionToken();

        // Here, send the form data to your app server to remove the product from the plan.

        done();
      },
    });

    setSecondaryAction({
      content: "Cancel",
      onAction: () => close(),
    });
  }, [getSessionToken, close, done, setPrimaryAction, setSecondaryAction]);

  return (
    <>
      <TextBlock size="extraLarge">Hello!</TextBlock>
      <Text>
        Remove Product id {data.productId} from Plan group id{" "}
        {data.sellingPlanGroupId}
      </Text>
    </>
  );
};

// 'Edit' mode should modify an existing selling plan.
// Changes should affect other products that have this plan applied.
// [Shopify admin renders this mode inside an app overlay container]
const Edit = () => {
  const data = useData();
  const { close, done } = useContainer();

  const { getSessionToken } = useSessionToken();

  const [planTitle, setPlanTitle] = useState<string>("Current plan");
  const [percentageOff, setPercentageOff] = useState<string>("10");
  const [deliveryFrequency, setDeliveryFrequency] = useState<string>("1");

  const onPrimaryAction = useCallback(async () => {
    /* const token = */ await getSessionToken();

    // Here, send the form data to your app server to modify the selling plan.

    done();
  }, [getSessionToken, done]);

  const cachedActions = useMemo(
    () => (
      <Actions onPrimary={onPrimaryAction} onClose={close} title="Edit plan" />
    ),
    [onPrimaryAction, close]
  );

  return (
    <>
      <BlockStack spacing="none">
        <TextBlock size="extraLarge">Hello! Edit subscription plan</TextBlock>
      </BlockStack>

      <Card
        title={`Edit subscription plan for Product id ${data.productId}`}
        sectioned
      >
        <TextField
          label="Plan title"
          value={planTitle}
          onChange={setPlanTitle}
        />
      </Card>

      <Card title="Delivery and discount" sectioned>
        <InlineStack>
          <TextField
            type="number"
            label="Delivery frequency (in weeks)"
            value={deliveryFrequency}
            onChange={setDeliveryFrequency}
          />
          <TextField
            type="number"
            label="Percentage off (%)"
            value={percentageOff}
            onChange={setPercentageOff}
          />
        </InlineStack>
      </Card>

      {cachedActions}
    </>
  );
};

function Actions({ onPrimary, onClose, title }) {
  return (
    <InlineStack inlineAlignment="trailing">
      <Button title="Cancel" onPress={onClose} />
      <Button title={title} onPress={onPrimary} kind="primary" />
    </InlineStack>
  );
}
