(globalThis as any).fetch = async () => ({
  async arrayBuffer() {
    new ArrayBuffer(0);
  }
});
