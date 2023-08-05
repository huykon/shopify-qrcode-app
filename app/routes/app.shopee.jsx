import { Card, Layout, Page, Text, VerticalStack } from "@shopify/polaris";


export default function ShopeePage() {
  return <Page>
    <ui-title-bar title="Shopee page" />
    <Layout>
      <Layout.Section>
        <Card>
          <VerticalStack gap='4'>
            <Text as="b" variant="bodyMd">This is test message of Shopee page from Mason</Text>
          </VerticalStack>
        </Card>
      </Layout.Section>
    </Layout>
  </Page>
}
